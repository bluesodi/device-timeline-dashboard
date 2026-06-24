import { Component, OnInit, OnDestroy, HostListener, ElementRef, NgZone, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TabsModule } from 'primeng/tabs';
import { SelectModule } from 'primeng/select';
import { SelectButtonModule } from 'primeng/selectbutton';

import { DeviceInfoCardComponent } from '../../components/device-info-card/device-info-card.component';
import { MetricChartComponent } from '../../components/metric-chart/metric-chart.component';
import { MetricConfigDrawerComponent } from '../../components/metric-config-drawer/metric-config-drawer.component';
import { AppMetricBlockComponent } from '../../components/app-metric-block/app-metric-block.component';
import { MetricDataService } from '../../services/metric-data.service';
import {
  DeviceInfo,
  MetricData,
  AppMetricGroup,
  MetricConfigState,
  TimeGranularityOption,
} from '../../models/metric-data';

@Component({
  selector: 'app-device-detail',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TabsModule,
    SelectModule,
    SelectButtonModule,
    DeviceInfoCardComponent,
    MetricChartComponent,
    MetricConfigDrawerComponent,
    AppMetricBlockComponent,
  ],
  template: `
    <div class="page">
      <!-- Device Info Card -->
      <app-device-info-card [device]="deviceInfo" />

      <!-- Tabs: Timeline / Log -->
      <div class="content-card">
        <p-tabs [(value)]="activeTab">
          <p-tablist>
            <p-tab value="timeline">时间线</p-tab>
            <p-tab value="log">日志</p-tab>
          </p-tablist>

          <p-tabpanels>
            <!-- ====== TIMELINE TAB ====== -->
            <p-tabpanel value="timeline">
              <!-- Filter Bar -->
              <div class="filter-bar">
                <div class="filter-left">
                  <span class="filter-label">指标筛选</span>
                  <button class="config-btn" title="指标配置" (click)="drawerVisible = true">
                    <i class="pi pi-sliders-h"></i>
                  </button>
                </div>
                <div class="filter-controls">
                  <!-- Time Range Dropdown -->
                  <p-select
                    [options]="timeRangeOptions"
                    [(ngModel)]="selectedTimeRange"
                    optionLabel="label"
                    styleClass="time-dropdown"
                    [style]="{ width: '150px' }"
                  />
                  <!-- Time Granularity -->
                  <p-selectbutton
                    [options]="granularityOptions"
                    [(ngModel)]="selectedGranularity"
                    optionLabel="label"
                    (onChange)="onGranularityChange()"
                    styleClass="granularity-selector"
                  />
                </div>
              </div>

              <!-- Time Axis Navigation -->
              <div class="time-axis">
                <div class="axis-left">
                  <button class="axis-nav-btn axis-zoom-btn" (click)="zoomOut()" title="缩小">
                    <i class="pi pi-search-minus"></i>
                  </button>
                  <button class="axis-nav-btn" (click)="shiftTime(-1)" title="左移">
                    <i class="pi pi-chevron-left"></i>
                  </button>
                </div>
                <div class="axis-ticks">
                  @for (tick of timeAxisTicks; track tick) {
                    <span class="axis-tick">{{ tick }}</span>
                  }
                </div>
                <div class="axis-right">
                  <button class="axis-nav-btn" (click)="shiftTime(1)" title="右移">
                    <i class="pi pi-chevron-right"></i>
                  </button>
                  <button class="axis-nav-btn axis-zoom-btn" (click)="zoomIn()" title="放大">
                    <i class="pi pi-search-plus"></i>
                  </button>
                </div>
              </div>

              <!-- ====== Chart Area (indicator container) ====== -->
              <div
                class="chart-area"
                (mousemove)="onChartMouseMove($event)"
                (mouseleave)="onChartMouseLeave()"
              >
                <!-- ====== Vertical indicator line & tooltip ====== -->
                <div class="indicator-overlay" [class.hidden]="!indicatorVisible">
                  <!-- Vertical line -->
                  <div
                    class="indicator-line"
                    [style.left.%]="indicatorLeftPercent"
                    (mousedown)="onIndicatorDragStart($event)"
                  >
                    <div class="indicator-handle"></div>
                  </div>

                  <!-- Data tooltip bubble (right of indicator, follows mouse Y) -->
                  <div
                    class="indicator-tooltip"
                    [style.left.%]="indicatorLeftPercent"
                    [style.top.px]="indicatorTopPx"
                  >
                    <div class="tooltip-arrow"></div>
                    <div class="tooltip-card">
                      <div class="tooltip-time">
                        时间范围：{{ formatTime(selectedTimeInterval.start) }} ~ {{ formatTime(selectedTimeInterval.end) }}
                      </div>
                      <div class="tooltip-list">
                        @for (item of tooltipData; track item.name) {
                          <div class="tooltip-row">
                            <span class="tooltip-label">{{ item.name }}</span>
                            <span class="tooltip-sep">—</span>
                            <span class="tooltip-value">{{ formatValue(item.value) }}{{ item.unit }}</span>
                          </div>
                        }
                      </div>
                    </div>
                  </div>
                </div>

                <!-- ====== 设备指标 ====== -->
                @if (filteredMetrics.length > 0) {
                  <div class="metric-section">
                    <div class="section-header">
                      <span class="section-icon"><i class="pi pi-server"></i></span>
                      <span class="section-title">设备指标</span>
                    </div>
                    <div class="metric-list">
                      @for (metric of filteredMetrics; track metric.id; let idx = $index) {
                        <div
                          class="draggable-row"
                          draggable="true"
                          (dragstart)="onDeviceDragStart($event, idx)"
                          (dragover)="onDeviceDragOver($event, idx)"
                          (dragleave)="onDeviceDragLeave($event)"
                          (drop)="onDeviceDrop($event, idx)"
                          (dragend)="onDeviceDragEnd($event)"
                        >
                          <app-metric-chart
                            [metric]="metric"
                            (barClicked)="onBarClicked($event)"
                          />
                        </div>
                      }
                    </div>
                  </div>
                }

                <!-- ====== 应用指标 ====== -->
                @if (hasAppSection && appGroups.length > 0) {
                  <div class="metric-section">
                    <div class="section-header">
                      <span class="section-icon"><i class="pi pi-th-large"></i></span>
                      <span class="section-title">应用指标</span>
                      <button class="app-toggle-all-btn" (click)="toggleAllApps()">
                        {{ allAppsExpanded ? '收缩所有应用' : '展开所有应用' }}
                      </button>
                    </div>
                    <div class="app-metric-list">
                      @for (group of appGroups; track group.appId) {
                        <app-metric-block [group]="group" (barClicked)="onBarClicked($event)" />
                      }
                    </div>
                  </div>
                }
              </div>
            </p-tabpanel>

            <!-- ====== LOG TAB ====== -->
            <p-tabpanel value="log">
              <div class="log-placeholder">
                <i class="pi pi-list log-icon"></i>
                <p>日志内容将在后续版本中实现</p>
              </div>
            </p-tabpanel>
          </p-tabpanels>
        </p-tabs>
      </div>

      <!-- ====== Bar Detail Drawer ====== -->
      <!-- Backdrop -->
      <div
        class="detail-drawer-backdrop"
        [class.open]="detailDrawerVisible"
        (click)="detailDrawerVisible = false"
      ></div>
      <!-- Panel -->
      <div class="detail-drawer-panel" [class.open]="detailDrawerVisible">
        <div class="detail-drawer-header">
          <span class="detail-drawer-title">
            <i class="pi pi-info-circle drawer-title-icon"></i>
            数据详情
          </span>
          <button class="drawer-close-btn" (click)="detailDrawerVisible = false">
            <i class="pi pi-times"></i>
          </button>
        </div>
        @if (detailBarData) {
          <div class="detail-drawer-body">
            <div class="detail-summary">
              <div class="detail-metric-name">{{ detailBarData.metricName }}</div>
              <div class="detail-field">
                <span class="detail-label">时间</span>
                <span class="detail-value">{{ formatTime(detailBarData.point.timestamp) }}</span>
              </div>
              <div class="detail-field">
                <span class="detail-label">数值</span>
                <span class="detail-value highlight">{{ detailBarData.point.value }} {{ detailBarData.unit }}</span>
              </div>
            </div>

            <div class="detail-section">
              <div class="detail-section-title">数据点上下文</div>
              <div class="detail-context-table">
                <div class="detail-context-row detail-context-header">
                  <span class="context-cell">时间偏移</span>
                  <span class="context-cell">时间</span>
                  <span class="context-cell">数值 ({{ detailBarData.unit }})</span>
                </div>
                @for (row of getDetailContextPoints(); track row.index) {
                  <div class="detail-context-row" [class.current]="row.isCurrent">
                    <span class="context-cell" [class.current]="row.isCurrent">{{ row.label }}</span>
                    <span class="context-cell" [class.current]="row.isCurrent">{{ formatTime(row.timestamp) }}</span>
                    <span class="context-cell" [class.current]="row.isCurrent">{{ row.value }}</span>
                  </div>
                }
              </div>
            </div>
          </div>
        }
      </div>

      <!-- ====== Metric Config Drawer ====== -->
      <app-metric-config-drawer
        [(visible)]="drawerVisible"
        (saved)="onConfigSaved($event)"
        (cancelled)="onConfigCancelled()"
      />
    </div>
  `,
  styles: [`
    .page {
      padding: 0;
    }

    .config-btn {
      width: 36px;
      height: 36px;
      border: 1px solid var(--border-medium);
      border-radius: var(--radius-sm);
      background: var(--bg-white);
      color: var(--text-secondary);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      transition: all 0.15s;
    }

    .config-btn:hover {
      border-color: var(--brand-primary-400);
      color: var(--brand-primary);
      background: var(--brand-primary-light);
    }

    /* ===== Content Card ===== */
    .content-card {
      background: var(--bg-white);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-md);
      padding: 20px 24px;
    }

    /* ===== Filter Bar ===== */
    .filter-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 0 16px;
    }

    .filter-left {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .filter-label {
      font-size: 14px;
      font-weight: 500;
      color: var(--text-primary);
    }

    .filter-controls {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    /* ===== Time Axis ===== */
    .time-axis {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 0 12px;
      border-bottom: 1px solid var(--border-light);
    }

    .axis-left {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-shrink: 0;
    }

    .axis-right {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-shrink: 0;
    }

    .axis-nav-btn {
      width: 24px;
      height: 24px;
      border: 1px solid var(--border-light);
      border-radius: 50%;
      background: var(--bg-white);
      color: var(--text-secondary);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 10px;
      flex-shrink: 0;
      transition: all 0.15s;
    }

    .axis-nav-btn:hover {
      background: var(--bg-hover);
      color: var(--text-primary);
    }

    .axis-zoom-btn {
      width: 28px;
      height: 28px;
      font-size: 12px;
      border-radius: var(--radius-sm);
    }

    .axis-zoom-btn:hover {
      color: var(--brand-primary);
      border-color: var(--brand-primary-400);
    }

    .axis-ticks {
      flex: 1;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .axis-tick {
      font-size: 11px;
      color: var(--text-muted);
      white-space: nowrap;
    }

    /* ===== Metric Section ===== */
    .metric-section {
      margin-top: 16px;
    }

    .section-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
      padding: 0 4px;
    }

    .section-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 26px;
      height: 26px;
      border-radius: var(--radius-sm);
      background: var(--brand-primary-light);
      color: var(--brand-primary);
      font-size: 12px;
    }

    .section-title {
      font-size: 14px;
      font-weight: 600;
      color: var(--text-primary);
    }

    .app-toggle-all-btn {
      margin-left: 12px;
      padding: 0;
      border: none;
      background: none;
      font-size: 12px;
      color: var(--brand-primary);
      cursor: pointer;
      font-weight: 500;
      transition: opacity 0.15s;
    }

    .app-toggle-all-btn:hover {
      opacity: 0.75;
      text-decoration: underline;
    }

    /* ===== Metric List ===== */
    .metric-list {
      margin-top: 4px;
    }

    .draggable-row {
      transition: transform 0.15s ease, box-shadow 0.15s;
    }

    .draggable-row.drag-over {
      box-shadow: 0 -2px 0 0 var(--brand-primary);
    }

    .draggable-row.dragging {
      opacity: 0.4;
    }

    /* ===== Chart Area (indicator container) ===== */
    .chart-area {
      position: relative;
      overflow: hidden;
    }

    /* ===== Vertical Indicator ===== */
    .indicator-overlay {
      position: absolute;
      inset: 0;
      pointer-events: none;
      z-index: 100;
      user-select: none;
    }

    .indicator-overlay.hidden {
      display: none;
    }

    .indicator-line {
      position: absolute;
      top: 0;
      bottom: 0;
      width: 2px;
      background: transparent;
      background-image: repeating-linear-gradient(
        to bottom,
        var(--brand-primary) 0px,
        var(--brand-primary) 6px,
        transparent 6px,
        transparent 12px
      );
      transform: translateX(-50%);
      pointer-events: auto;
      cursor: pointer;
      z-index: 101;
    }

    .indicator-handle {
      position: absolute;
      top: -4px;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: var(--brand-primary);
      border: 2px solid #fff;
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
    }

    /* ===== Tooltip Bubble ===== */
    .indicator-tooltip {
      position: absolute;
      z-index: 102;
      padding-left: 14px;
      pointer-events: none;
      transform: translateY(-50%);
    }

    .tooltip-card {
      background: #fff;
      border-radius: 10px;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
      padding: 12px 14px;
      min-width: 280px;
      max-width: 380px;
      max-height: 320px;
      overflow-y: auto;
    }

    .tooltip-time {
      font-size: 12px;
      color: #666;
      margin-bottom: 8px;
      padding-bottom: 8px;
      border-bottom: 1px solid #f0f0f0;
      line-height: 1.5;
    }

    .tooltip-list {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .tooltip-row {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      line-height: 1.6;
    }

    .tooltip-label {
      color: #666;
      flex-shrink: 0;
      max-width: 160px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .tooltip-sep {
      color: #999;
      flex-shrink: 0;
    }

    .tooltip-value {
      font-weight: 600;
      color: #333;
      flex-shrink: 0;
    }

    .tooltip-arrow {
      position: absolute;
      top: 12px;
      left: 4px;
      width: 0;
      height: 0;
      border-top: 6px solid transparent;
      border-bottom: 6px solid transparent;
      border-right: 8px solid #fff;
      filter: drop-shadow(-1px 0 2px rgba(0, 0, 0, 0.08));
    }

    .app-metric-list {
      margin-top: 8px;
    }

    /* ===== Detail Drawer ===== */
    .detail-drawer-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.25);
      z-index: 900;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.25s ease;
    }
    .detail-drawer-backdrop.open {
      opacity: 1;
      pointer-events: auto;
    }

    .detail-drawer-panel {
      position: fixed;
      top: 0;
      right: 0;
      width: 420px;
      height: 100vh;
      background: var(--bg-white);
      box-shadow: -4px 0 24px rgba(0, 0, 0, 0.1);
      z-index: 910;
      display: flex;
      flex-direction: column;
      transform: translateX(100%);
      transition: transform 0.28s ease;
    }
    .detail-drawer-panel.open {
      transform: translateX(0);
    }

    .detail-drawer-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 20px 24px 16px;
      border-bottom: 1px solid var(--border-light);
      flex-shrink: 0;
    }
    .detail-drawer-title {
      font-size: 16px;
      font-weight: 600;
      color: var(--text-primary);
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .drawer-title-icon {
      color: var(--brand-primary);
      font-size: 18px;
    }
    .drawer-close-btn {
      width: 30px;
      height: 30px;
      border: none;
      border-radius: var(--radius-sm);
      background: transparent;
      color: var(--text-secondary);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      transition: all 0.15s;
    }
    .drawer-close-btn:hover {
      background: var(--bg-hover);
      color: var(--text-primary);
    }

    .detail-drawer-body {
      flex: 1;
      overflow-y: auto;
      padding: 20px 24px;
    }

    .detail-summary {
      background: var(--brand-primary-light);
      border-radius: var(--radius-md);
      padding: 16px;
      margin-bottom: 20px;
    }
    .detail-metric-name {
      font-size: 15px;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 12px;
    }
    .detail-field {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 6px;
      font-size: 13px;
    }
    .detail-label {
      color: var(--text-muted);
      min-width: 40px;
    }
    .detail-value {
      color: var(--text-primary);
    }
    .detail-value.highlight {
      font-size: 18px;
      font-weight: 700;
      color: var(--brand-primary);
    }

    .detail-section-title {
      font-size: 13px;
      font-weight: 600;
      color: var(--text-secondary);
      margin-bottom: 10px;
    }

    .detail-context-table {
      border: 1px solid var(--border-light);
      border-radius: var(--radius-sm);
      overflow: hidden;
    }
    .detail-context-row {
      display: flex;
      padding: 8px 12px;
      border-bottom: 1px solid var(--border-light);
      font-size: 12px;
    }
    .detail-context-row:last-child {
      border-bottom: none;
    }
    .detail-context-header {
      background: var(--bg-hover);
      font-weight: 600;
      color: var(--text-secondary);
    }
    .detail-context-row.current {
      background: var(--brand-primary-light);
      font-weight: 600;
    }
    .context-cell {
      flex: 1;
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      color: var(--text-primary);
    }
    .context-cell.current {
      color: var(--brand-primary);
    }

    /* ===== Log placeholder ===== */
    .log-placeholder {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 0;
      color: var(--text-muted);
    }

    .log-icon {
      font-size: 40px;
      margin-bottom: 12px;
    }

    .log-placeholder p {
      font-size: 14px;
    }
  `],
})
export class DeviceDetailComponent implements OnInit, OnDestroy {
  // Device info
  deviceInfo: DeviceInfo = {
    name: 'DESKTOP-EISQPKE',
    model: 'Latitude 3420',
    os: 'Microsoft Windows 10 专业版',
    osVersion: '22H2',
    eventTime: '2026-06-12 06:04:50',
    detail: {
      ipAddress: '192.168.1.105',
      macAddress: '00:1B:44:11:3A:B7',
      cpuCores: '8 核 (Intel Core i7-1165G7)',
      totalMemory: '16 GB DDR4-3200',
      diskTotal: '512 GB NVMe SSD',
      biosVersion: 'Dell Inc. 1.28.0 (2025/09/15)',
      lastBootTime: '2026-06-10 09:15:32',
      agentVersion: 'v3.7.2-beta.1',
    },
  };

  // Tabs
  activeTab = 'timeline';

  // Time controls
  timeRangeOptions = [
    { label: '之前的24小时', value: '24h' },
    { label: '之前的12小时', value: '12h' },
    { label: '之前的6小时', value: '6h' },
    { label: '之前的1小时', value: '1h' },
  ];
  selectedTimeRange = this.timeRangeOptions[0];

  granularityOptions: TimeGranularityOption[] = [
    { label: '10分钟', value: 10 },
    { label: '15分钟', value: 15 },
    { label: '30分钟', value: 30 },
  ];
  selectedGranularity = this.granularityOptions[0];

  // All metrics (raw)
  private allMetrics: MetricData[] = [];

  // Filtered device metrics (visible)
  filteredMetrics: MetricData[] = [];

  // App metric groups
  appGroups: AppMetricGroup[] = [];

  // Config state
  /** ids of device metrics that are currently visible */
  private visibleDeviceMetricIds: Set<string> = new Set([
    'cpu', 'memory', 'disk-io', 'disk-read-iops', 'disk-write-iops',
    'disk-read-latency', 'disk-write-latency', 'disk-avg-queue',
  ]);
  /** ids of app metrics that are currently visible */
  visibleAppMetricIds: Set<string> = new Set([
    'app-cpu', 'app-memory', 'app-handles', 'app-processes',
  ]);
  appMode: 'top10' | 'custom' = 'top10';
  selectedAppIds: string[] = [
    'chrome', 'vscode', 'outlook', 'teams', 'node',
  ];

  get hasAppSection(): boolean {
    return this.visibleAppMetricIds.size > 0;
  }

  /** Whether all app blocks are currently expanded */
  get allAppsExpanded(): boolean {
    return this.appGroups.length > 0 && this.appGroups.every(g => g.isExpanded);
  }

  /** Toggle expand/collapse all app blocks */
  toggleAllApps(): void {
    const expand = !this.allAppsExpanded;
    this.appGroups.forEach(g => (g.isExpanded = expand));
    this.appGroups = [...this.appGroups];
  }

  // Time axis
  timeAxisTicks: string[] = [];
  private timeOffset = 0;
  zoomLevel = 0;

  // Drawer
  drawerVisible = false;

  // Drag state
  private dragDeviceIdx = -1;

  // Vertical time indicator (cursor/tooltip)
  indicatorVisible = false; // default: hidden
  indicatorLeftPercent = 50; // position as % of container width
  indicatorTopPx = 0; // vertical position in px (follows mouse)
  isDraggingIndicator = false;

  // Bar detail drawer
  detailDrawerVisible = false;
  detailBarData: {
    metricId: string;
    metricName: string;
    barIndex: number;
    point: { timestamp: number; value: number };
    unit: string;
  } | null = null;

  // Cached tooltip data (recomputed only when mouse actually moves)
  private _tooltipData: Array<{ name: string; value: number; unit: string }> = [];
  get tooltipData(): Array<{ name: string; value: number; unit: string }> {
    return this._tooltipData;
  }

  get selectedTimeInterval(): { start: Date; end: Date } {
    return this._selectedTimeInterval;
  }
  private _selectedTimeInterval: { start: Date; end: Date } = { start: new Date(), end: new Date() };

  /** Find the closest data point at the given percentage and get its value */
  private getValueAtPercent(metric: MetricData, percent: number): number | null {
    if (!metric.points || metric.points.length === 0) return null;
    const idx = Math.round((percent / 100) * (metric.points.length - 1));
    return metric.points[Math.max(0, Math.min(idx, metric.points.length - 1))].value;
  }

  private containerRect?: DOMRect;

  constructor(
    private metricService: MetricDataService,
    private elRef: ElementRef,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef,
  ) {}

  private resizeObserver?: ResizeObserver;

  ngOnInit(): void {
    this.loadMetrics();
    this.updateTimeAxis();

    this.resizeObserver = new ResizeObserver(() => {
      this.refreshMetrics();
    });
    const container = document.querySelector('.metric-list');
    if (container) {
      this.resizeObserver.observe(container);
    }
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
  }

  loadMetrics(): void {
    const eventTime = new Date(2026, 5, 12, 6, 4, 50);
    this.allMetrics = this.metricService.generateMetrics(eventTime, this.selectedGranularity.value);
    this.applyDeviceFilter();
    this.loadAppMetrics();
  }

  /** Apply device metric visibility filter */
  private applyDeviceFilter(): void {
    this.filteredMetrics = this.allMetrics.filter((m) =>
      this.visibleDeviceMetricIds.has(m.id)
    );
  }

  /** Generate app metric groups for selected apps */
  private loadAppMetrics(): void {
    if (!this.hasAppSection) {
      this.appGroups = [];
      return;
    }

    const eventTime = new Date(2026, 5, 12, 6, 4, 50);
    let apps: { id: string; name: string; version: string }[] = [];

    if (this.appMode === 'top10') {
      // TOP10: use the first 5 apps from the drawer's default list
      apps = [
        { id: 'chrome', name: 'Chrome', version: 'v125.0.6422' },
        { id: 'vscode', name: 'VS Code', version: 'v1.90.0' },
        { id: 'outlook', name: 'Outlook', version: 'v2405' },
        { id: 'teams', name: 'Microsoft Teams', version: 'v24107' },
        { id: 'node', name: 'Node.js', version: 'v20.14.0' },
      ];
    } else {
      // Custom: use selectedAppIds (first 5 for display)
      const selected = this.selectedAppIds.slice(0, 5);
      apps = selected.map((id) => {
        const name = this.appNameMap[id] ?? id;
        return { id, name, version: '' };
      });
    }

    this.appGroups = this.metricService.generateAppMetrics(
      eventTime,
      this.selectedGranularity.value,
      apps
    );

    // Filter each app's metrics based on visibleAppMetricIds
    for (const group of this.appGroups) {
      group.metrics = group.metrics.filter(m => {
        // Check if any visible app metric id is a prefix of the generated metric id
        for (const vid of this.visibleAppMetricIds) {
          if (m.id.startsWith(vid + '-') || m.id === vid) return true;
        }
        return false;
      });
    }
  }

  private appNameMap: Record<string, string> = {
    chrome: 'Chrome',
    vscode: 'VS Code',
    outlook: 'Outlook',
    teams: 'Microsoft Teams',
    excel: 'Microsoft Excel',
    node: 'Node.js',
    docker: 'Docker Desktop',
    slack: 'Slack',
    spotify: 'Spotify',
    notion: 'Notion',
    figma: 'Figma',
    postman: 'Postman',
    'vscode-insiders': 'VS Code Insiders',
    edge: 'Microsoft Edge',
    firefox: 'Firefox',
  };

  onGranularityChange(): void {
    this.loadMetrics();
    this.updateTimeAxis();
  }

  zoomIn(): void {
    if (this.zoomLevel < 2) {
      this.zoomLevel++;
      this.updateTimeAxis();
    }
  }

  zoomOut(): void {
    if (this.zoomLevel > -2) {
      this.zoomLevel--;
      this.updateTimeAxis();
    }
  }

  shiftTime(direction: number): void {
    this.timeOffset += direction * 6;
    this.updateTimeAxis();
  }

  updateTimeAxis(): void {
    const baseTime = new Date(2026, 5, 12, 6, 4, 50);
    baseTime.setHours(baseTime.getHours() + this.timeOffset);

    const zoomMap: Record<number, { windowHours: number; step: number }> = {
      [-2]: { windowHours: 96, step: 16 },
      [-1]: { windowHours: 48, step: 8 },
      [0]: { windowHours: 24, step: 4 },
      [1]: { windowHours: 12, step: 2 },
      [2]: { windowHours: 6, step: 1 },
    };
    const { windowHours, step } = zoomMap[this.zoomLevel] ?? zoomMap[0];
    const half = windowHours / 2;

    const ticks: string[] = [];
    for (let h = -half; h <= half; h += step) {
      const t = new Date(baseTime);
      t.setHours(t.getHours() + h);
      const hh = t.getHours().toString().padStart(2, '0');
      const mm = t.getMinutes().toString().padStart(2, '0');
      const md = `${t.getMonth() + 1}/${t.getDate()}`;

      if (h === -half) {
        ticks.push(`${md} ${hh}:${mm}`);
      } else {
        ticks.push(`${hh}:${mm}`);
      }
    }

    this.timeAxisTicks = ticks;
  }

  onConfigSaved(config: MetricConfigState): void {
    // Update device metric visibility
    this.visibleDeviceMetricIds = new Set(
      config.deviceMetrics.filter((m) => m.selected).map((m) => m.id)
    );

    // Update app metric visibility
    this.visibleAppMetricIds = new Set(
      config.appMetrics.filter((m) => m.selected).map((m) => m.id)
    );

    // Update app mode & selection
    this.appMode = config.appMode;
    this.selectedAppIds = config.availableApps
      .filter((a) => a.selected)
      .map((a) => a.id);

    this.loadMetrics();
  }

  onConfigCancelled(): void {
    // no-op
  }

  private refreshMetrics(): void {
    this.filteredMetrics = [...this.filteredMetrics];
    this.appGroups = [...this.appGroups];
  }

  @HostListener('window:resize')
  onResize(): void {
    this.refreshMetrics();
  }

  // === Device metric drag and drop ===

  onDeviceDragStart(event: DragEvent, index: number): void {
    this.dragDeviceIdx = index;
    (event.target as HTMLElement).classList.add('dragging');
    event.dataTransfer!.effectAllowed = 'move';
    event.dataTransfer!.setData('text/plain', String(index));
  }

  onDeviceDragOver(event: DragEvent, index: number): void {
    event.preventDefault();
    event.dataTransfer!.dropEffect = 'move';

    if (this.dragDeviceIdx !== index && this.dragDeviceIdx >= 0) {
      (event.target as HTMLElement).closest('.draggable-row')?.classList.add('drag-over');
    }
  }

  onDeviceDragLeave(event: DragEvent): void {
    const row = (event.target as HTMLElement).closest('.draggable-row');
    if (row) {
      row.classList.remove('drag-over');
    }
  }

  onDeviceDrop(event: DragEvent, toIndex: number): void {
    event.preventDefault();
    event.stopPropagation();

    this.removeDragOver();
    if (this.dragDeviceIdx < 0 || this.dragDeviceIdx === toIndex) {
      return;
    }

    // Reorder filtered metrics
    const item = this.filteredMetrics[this.dragDeviceIdx];
    this.filteredMetrics.splice(this.dragDeviceIdx, 1);
    this.filteredMetrics.splice(toIndex, 0, item);
    this.filteredMetrics = [...this.filteredMetrics];
  }

  onDeviceDragEnd(event: DragEvent): void {
    (event.target as HTMLElement).classList.remove('dragging');
    this.removeDragOver();
    this.dragDeviceIdx = -1;
  }

  private removeDragOver(): void {
    document.querySelectorAll('.draggable-row.drag-over').forEach(el => {
      el.classList.remove('drag-over');
    });
  }

  // === Vertical indicator & tooltip ===

  private _rAFId = 0;
  private _pendingX = 0;
  private _pendingY = 0;
  private _pendingVisible = false;

  formatTime(dateOrTs: Date | number): string {
    const d = dateOrTs instanceof Date ? dateOrTs : new Date(dateOrTs);
    const y = d.getFullYear();
    const mo = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const h = String(d.getHours()).padStart(2, '0');
    const mi = String(d.getMinutes()).padStart(2, '0');
    const s = String(d.getSeconds()).padStart(2, '0');
    return `${y}-${mo}-${dd} ${h}:${mi}:${s}`;
  }

  formatValue(v: number): string {
    if (Number.isInteger(v)) return v.toString();
    return v.toFixed(2);
  }

  onChartMouseMove(event: MouseEvent): void {
    if (this.isDraggingIndicator) {
      this.updateIndicatorFromEvent(event);
      return;
    }

    // Only show indicator when hovering over a metric-chart-area (bar canvas)
    const target = event.target as HTMLElement;
    const inChartArea = target.closest('.metric-chart-area');
    if (!inChartArea) {
      this._pendingVisible = false;
      this.scheduleIndicatorUpdate();
      return;
    }

    const chartArea = this.elRef.nativeElement.querySelector('.chart-area') as HTMLElement;
    if (!chartArea) return;

    const rect = chartArea.getBoundingClientRect();
    this.containerRect = rect;

    this._pendingX = Math.max(0, Math.min(100, ((event.clientX - rect.left) / rect.width) * 100));
    this._pendingY = event.clientY - rect.top;
    this._pendingVisible = true;
    this.scheduleIndicatorUpdate();
  }

  /** Run outside Angular zone to avoid per-pixel change detection; batch via rAF */
  private scheduleIndicatorUpdate(): void {
    if (this._rAFId) return; // already scheduled
    this.ngZone.runOutsideAngular(() => {
      this._rAFId = window.requestAnimationFrame(() => {
        this._rAFId = 0;

        const changed =
          this.indicatorLeftPercent !== this._pendingX ||
          this.indicatorTopPx !== this._pendingY ||
          this.indicatorVisible !== this._pendingVisible;

        if (!changed) return;

        this.indicatorLeftPercent = this._pendingX;
        this.indicatorTopPx = this._pendingY;
        this.indicatorVisible = this._pendingVisible;

        // Compute tooltip data & time here (once per frame, not per pixel)
        if (this._pendingVisible) {
          this.recomputeTooltip();
        }

        this.cdr.detectChanges();
      });
    });
  }

  /** Recompute tooltip data and time interval (called once per frame, only when visible) */
  private recomputeTooltip(): void {
    // Time interval
    const baseTime = new Date(2026, 5, 12, 6, 4, 50);
    baseTime.setHours(baseTime.getHours() + this.timeOffset);

    const zoomMap: Record<number, { windowHours: number }> = {
      [-2]: { windowHours: 96 },
      [-1]: { windowHours: 48 },
      [0]: { windowHours: 24 },
      [1]: { windowHours: 12 },
      [2]: { windowHours: 6 },
    };
    const { windowHours } = zoomMap[this.zoomLevel] ?? zoomMap[0];
    const start = new Date(baseTime.getTime() - (windowHours / 2) * 60 * 60 * 1000);
    const totalMs = windowHours * 60 * 60 * 1000;
    const currentMs = (this.indicatorLeftPercent / 100) * totalMs;
    const currentStart = new Date(start.getTime() + currentMs);
    const intervalMs = this.selectedGranularity.value * 60 * 1000;
    const currentEnd = new Date(currentStart.getTime() + intervalMs);
    this._selectedTimeInterval = { start: currentStart, end: currentEnd };

    // Tooltip data
    const result: Array<{ name: string; value: number; unit: string }> = [];
    this.filteredMetrics.forEach(m => {
      const val = this.getValueAtPercent(m, this.indicatorLeftPercent);
      if (val !== null) result.push({ name: m.name, value: val, unit: m.unit });
    });
    this.appGroups.forEach(group => {
      if (group.isExpanded) {
        group.metrics.forEach(m => {
          const val = this.getValueAtPercent(m, this.indicatorLeftPercent);
          if (val !== null) result.push({ name: `${group.appName} ${m.name}`, value: val, unit: m.unit });
        });
      }
    });
    this._tooltipData = result;
  }

  onChartMouseLeave(): void {
    this._pendingVisible = false;
    this.indicatorVisible = false;
    this.cdr.detectChanges();
  }

  onIndicatorDragStart(event: MouseEvent): void {
    event.preventDefault();
    this.isDraggingIndicator = true;

    const onMouseMove = (e: MouseEvent) => {
      this.updateIndicatorFromEvent(e);
    };

    const onMouseUp = () => {
      this.isDraggingIndicator = false;
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }

  private updateIndicatorFromEvent(event: MouseEvent): void {
    if (!this.containerRect) {
      const chartArea = this.elRef.nativeElement.querySelector('.chart-area') as HTMLElement;
      if (!chartArea) return;
      this.containerRect = chartArea.getBoundingClientRect();
    }

    const x = event.clientX - this.containerRect.left;
    const pct = Math.max(0, Math.min(100, (x / this.containerRect.width) * 100));
    this.indicatorLeftPercent = pct;
  }

  // === Bar click → detail drawer ===

  onBarClicked(data: {
    metricId: string;
    metricName: string;
    barIndex: number;
    point: { timestamp: number; value: number };
    unit: string;
  }): void {
    this.detailBarData = data;
    this.detailDrawerVisible = true;
  }

  /** Get surrounding context points (±2) for the detail drawer table */
  getDetailContextPoints(): Array<{
    index: number;
    label: string;
    timestamp: number;
    value: number;
    isCurrent: boolean;
  }> {
    if (!this.detailBarData) return [];

    // Find the source metric
    const metric = [...this.filteredMetrics, ...this.appGroups.flatMap(g => g.metrics)]
      .find(m => m.id === this.detailBarData!.metricId);
    if (!metric) return [];

    const currentIdx = this.detailBarData.barIndex;
    const result: Array<{ index: number; label: string; timestamp: number; value: number; isCurrent: boolean }> = [];

    for (let i = -2; i <= 2; i++) {
      const idx = currentIdx + i;
      if (idx < 0 || idx >= metric.points.length) continue;

      const p = metric.points[idx];
      result.push({
        index: idx,
        label: i === 0 ? '当前 (current)' : (i > 0 ? `+${i}` : `${i}`),
        timestamp: p.timestamp,
        value: p.value,
        isCurrent: i === 0,
      });
    }

    return result;
  }
}