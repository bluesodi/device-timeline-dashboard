import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MetricOption, AppOption, MetricConfigState } from '../../models/metric-data';

interface AppTableRow {
  id: string;
  name: string;
  selected: boolean;
  cpuUsage: number;
  memoryUsage: number;
  diskIO: string;
  networkIO: string;
  handles: number;
  processes: number;
}

@Component({
  selector: 'app-metric-config-drawer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <!-- Backdrop -->
    <div
      class="drawer-backdrop"
      [class.open]="visible"
      (click)="onCancel()"
    ></div>

    <!-- Drawer panel -->
    <div class="drawer-panel" [class.open]="visible">
      <!-- Header -->
      <div class="drawer-header">
        <span class="drawer-title">
          <i class="pi pi-sliders-h drawer-title-icon"></i>
          指标配置
        </span>
        <button class="drawer-close-btn" (click)="onCancel()">
          <i class="pi pi-times"></i>
        </button>
      </div>

      <!-- Body -->
      <div class="drawer-body">
        <!-- ====== 指标配置 ====== -->
        <div class="config-section">
          <div class="section-header">
            <span class="section-icon"><i class="pi pi-chart-bar"></i></span>
            <span class="section-title">指标配置</span>
          </div>

          <!-- 设备指标 -->
          <div class="sub-section">
            <div class="sub-header">
              <span class="sub-title">设备指标</span>
              <label class="select-all-label">
                <input
                  type="checkbox"
                  [checked]="allDeviceSelected"
                  (change)="toggleAllDevice()"
                />
                <span>全选</span>
              </label>
            </div>
            <div class="check-grid">
              @for (m of deviceMetrics; track m.id) {
                <label class="check-item">
                  <input
                    type="checkbox"
                    [(ngModel)]="m.selected"
                    (change)="onMetricToggle()"
                  />
                  <span>{{ m.name }}</span>
                </label>
              }
            </div>
          </div>

          <!-- 应用指标 -->
          <div class="sub-section">
            <div class="sub-header">
              <span class="sub-title">应用指标</span>
              <label class="select-all-label">
                <input
                  type="checkbox"
                  [checked]="allAppMetricsSelected"
                  (change)="toggleAllAppMetrics()"
                />
                <span>全选</span>
              </label>
            </div>
            <div class="check-grid">
              @for (m of appMetrics; track m.id) {
                <label class="check-item">
                  <input
                    type="checkbox"
                    [(ngModel)]="m.selected"
                    (change)="onMetricToggle()"
                  />
                  <span>{{ m.name }}</span>
                </label>
              }
            </div>
          </div>
        </div>

        <!-- ====== 应用配置 ====== -->
        <div class="config-section">
          <div class="section-header">
            <span class="section-icon"><i class="pi pi-th-large"></i></span>
            <span class="section-title">应用配置</span>
          </div>

          <div class="app-mode-tabs">
            <button
              class="mode-tab"
              [class.active]="appMode === 'top10'"
              (click)="appMode = 'top10'"
            >
              Top10 应用
            </button>
            <button
              class="mode-tab"
              [class.active]="appMode === 'custom'"
              (click)="appMode = 'custom'"
            >
              自定义选择
            </button>
          </div>

          @if (appMode === 'top10') {
            <p class="mode-desc">请选择问题指标类别</p>
            <div class="top10-radio-grid">
              <label class="radio-item">
                <input type="radio" name="top10Metric" value="cpu-memory" [(ngModel)]="top10Metric" />
                <span>CPU内存使用率</span>
              </label>
              <label class="radio-item">
                <input type="radio" name="top10Metric" value="memory" [(ngModel)]="top10Metric" />
                <span>内存使用率</span>
              </label>
              <label class="radio-item">
                <input type="radio" name="top10Metric" value="crash" [(ngModel)]="top10Metric" />
                <span>应用奔溃次数</span>
              </label>
              <label class="radio-item">
                <input type="radio" name="top10Metric" value="hang" [(ngModel)]="top10Metric" />
                <span>应用挂起次数</span>
              </label>
            </div>
          } @else {
            <p class="mode-desc">从列表中选择需要监控的应用程序（最多 50 个）</p>
          }

          <!-- Custom app list -->
          @if (appMode === 'custom') {
            <div class="custom-app-section">
              <div class="custom-app-header">
                <label class="select-all-label">
                  <input
                    type="checkbox"
                    [checked]="allAppsSelected"
                    (change)="toggleAllApps()"
                  />
                  <span>全选</span>
                </label>
                <span class="selected-count">已选 {{ selectedAppCount }} / {{ appTableData.length }}</span>
              </div>
              <div class="app-table-wrapper">
                <table class="app-table">
                  <thead>
                    <tr>
                      <th class="col-check"></th>
                      <th class="col-name">应用名称</th>
                      <th class="col-bar">CPU</th>
                      <th class="col-bar">内存</th>
                      <th class="col-num">磁盘I/O</th>
                      <th class="col-num">网络I/O</th>
                      <th class="col-num">句柄数</th>
                      <th class="col-num">进程数</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (row of appTableData; track row.id) {
                      <tr class="app-table-row" [class.selected]="row.selected">
                        <td class="col-check">
                          <input
                            type="checkbox"
                            [(ngModel)]="row.selected"
                            [disabled]="!row.selected && selectedAppCount >= 50"
                          />
                        </td>
                        <td class="col-name">{{ row.name }}</td>
                        <td class="col-bar">
                          <div class="progress-bar-wrap">
                            <div
                              class="progress-bar-fill"
                              [style.width.%]="row.cpuUsage"
                              [style.background]="row.cpuUsage > 80 ? '#ef4444' : '#8b5cf6'"
                            ></div>
                            <span class="progress-val">{{ row.cpuUsage }}%</span>
                          </div>
                        </td>
                        <td class="col-bar">
                          <div class="progress-bar-wrap">
                            <div
                              class="progress-bar-fill"
                              [style.width.%]="row.memoryUsage"
                              [style.background]="row.memoryUsage > 80 ? '#ef4444' : '#8b5cf6'"
                            ></div>
                            <span class="progress-val">{{ row.memoryUsage }}%</span>
                          </div>
                        </td>
                        <td class="col-num">{{ row.diskIO }}</td>
                        <td class="col-num">{{ row.networkIO }}</td>
                        <td class="col-num">{{ row.handles }}</td>
                        <td class="col-num">{{ row.processes }}</td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            </div>
          }
        </div>
      </div>

      <!-- Footer -->
      <div class="drawer-footer">
        <button class="footer-btn btn-cancel" (click)="onCancel()">
          取消
        </button>
        <button class="footer-btn btn-save" (click)="onSave()">
          保存
        </button>
      </div>
    </div>
  `,
  styles: [`
    /* ===== Backdrop ===== */
    .drawer-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.25);
      z-index: 900;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.25s ease;
    }
    .drawer-backdrop.open {
      opacity: 1;
      pointer-events: auto;
    }

    /* ===== Drawer Panel ===== */
    .drawer-panel {
      position: fixed;
      top: 0;
      right: 0;
      width: 34vw;
      min-width: 520px;
      max-width: 680px;
      height: 100vh;
      background: var(--bg-white);
      box-shadow: -4px 0 24px rgba(0, 0, 0, 0.1);
      z-index: 910;
      display: flex;
      flex-direction: column;
      transform: translateX(100%);
      transition: transform 0.28s ease;
    }
    .drawer-panel.open {
      transform: translateX(0);
    }

    /* ===== Header ===== */
    .drawer-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 20px 24px 16px;
      border-bottom: 1px solid var(--border-light);
      flex-shrink: 0;
    }
    .drawer-title {
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

    /* ===== Body ===== */
    .drawer-body {
      flex: 1;
      overflow-y: auto;
      padding: 16px 24px;
    }

    /* Section */
    .config-section {
      margin-bottom: 24px;
    }
    .section-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 14px;
    }
    .section-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      border-radius: var(--radius-sm);
      background: var(--brand-primary-light);
      color: var(--brand-primary);
      font-size: 13px;
    }
    .section-title {
      font-size: 15px;
      font-weight: 600;
      color: var(--text-primary);
    }

    /* Sub section */
    .sub-section {
      margin-bottom: 16px;
    }
    .sub-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 10px;
    }
    .sub-title {
      font-size: 13px;
      font-weight: 500;
      color: var(--text-primary);
    }
    .select-all-label {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
      color: var(--brand-primary);
      cursor: pointer;
      user-select: none;
    }
    .select-all-label input {
      accent-color: var(--brand-primary);
      cursor: pointer;
    }

    /* Checkbox grid */
    .check-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 6px;
    }
    .check-item {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 6px 8px;
      border-radius: var(--radius-sm);
      font-size: 13px;
      color: var(--text-secondary);
      cursor: pointer;
      transition: background 0.12s;
    }
    .check-item:hover {
      background: var(--bg-hover);
    }
    .check-item input {
      accent-color: var(--brand-primary);
      cursor: pointer;
    }

    /* ===== App Mode Tabs ===== */
    .app-mode-tabs {
      display: flex;
      background: var(--bg-hover);
      border-radius: var(--radius-sm);
      padding: 3px;
      margin-bottom: 8px;
    }
    .mode-tab {
      flex: 1;
      padding: 7px 12px;
      border: none;
      border-radius: calc(var(--radius-sm) - 1px);
      background: transparent;
      color: var(--text-secondary);
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.15s;
    }
    .mode-tab.active {
      background: var(--bg-white);
      color: var(--text-primary);
      box-shadow: var(--shadow-sm);
    }
    .mode-tab:hover:not(.active) {
      color: var(--text-primary);
    }

    .mode-desc {
      font-size: 12px;
      color: var(--text-muted);
      margin-bottom: 12px;
    }

    /* ===== TOP10 指标单选 ===== */
    .top10-radio-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 8px;
      margin-bottom: 12px;
    }
    .radio-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      border: 1px solid var(--border-light);
      border-radius: var(--radius-sm);
      font-size: 13px;
      color: var(--text-secondary);
      cursor: pointer;
      transition: all 0.15s;
    }
    .radio-item:hover {
      background: var(--bg-hover);
      border-color: var(--brand-primary);
    }
    .radio-item input[type="radio"] {
      accent-color: var(--brand-primary);
      cursor: pointer;
    }
    .radio-item:has(input:checked) {
      border-color: var(--brand-primary);
      background: var(--brand-primary-light);
      color: var(--brand-primary);
      font-weight: 500;
    }

    /* ===== Custom App List ===== */
    .custom-app-section {
      border: 1px solid var(--border-light);
      border-radius: var(--radius-md);
      overflow: hidden;
    }
    .custom-app-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 12px;
      background: var(--bg-hover);
      border-bottom: 1px solid var(--border-light);
      font-size: 12px;
    }
    .selected-count {
      color: var(--text-muted);
    }

    .app-table-wrapper {
      max-height: 360px;
      overflow-y: auto;
    }

    .app-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 12px;
    }

    .app-table thead {
      position: sticky;
      top: 0;
      z-index: 1;
    }

    .app-table thead th {
      padding: 8px 10px;
      text-align: left;
      font-weight: 500;
      color: var(--text-muted);
      background: var(--bg-hover);
      border-bottom: 1px solid var(--border-light);
      white-space: nowrap;
    }

    .app-table tbody td {
      padding: 7px 10px;
      border-bottom: 1px solid var(--border-light);
      vertical-align: middle;
      white-space: nowrap;
    }

    .app-table-row:last-child td {
      border-bottom: none;
    }

    .app-table-row:hover {
      background: var(--bg-hover);
    }
    .app-table-row.selected {
      background: var(--brand-primary-light);
    }

    .col-check {
      width: 40px;
      text-align: center;
      white-space: nowrap;
    }
    .col-check input {
      accent-color: var(--brand-primary);
      cursor: pointer;
    }

    .col-name {
      width: 120px;
      font-weight: 500;
      color: var(--text-primary);
      white-space: nowrap;
    }

    .col-bar {
      width: 110px;
      white-space: nowrap;
    }

    .col-num {
      width: 80px;
      text-align: right;
      color: var(--text-secondary);
      font-variant-numeric: tabular-nums;
      white-space: nowrap;
    }

    /* Progress bars */
    .progress-bar-wrap {
      position: relative;
      height: 16px;
      background: var(--bg-hover);
      border-radius: 8px;
      overflow: hidden;
      min-width: 64px;
    }
    .progress-bar-fill {
      height: 100%;
      border-radius: 8px;
      transition: width 0.3s ease;
    }
    .progress-val {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      line-height: 16px;
      text-align: center;
      font-size: 10px;
      font-weight: 600;
      color: white;
      text-shadow: 0 1px 1px rgba(0,0,0,0.3);
    }

    /* ===== Footer ===== */
    .drawer-footer {
      display: flex;
      gap: 10px;
      padding: 16px 24px;
      border-top: 1px solid var(--border-light);
      flex-shrink: 0;
    }
    .footer-btn {
      flex: 1;
      padding: 10px 0;
      border-radius: var(--radius-md);
      border: none;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.15s;
    }
    .btn-cancel {
      background: var(--bg-hover);
      color: var(--text-secondary);
    }
    .btn-cancel:hover {
      background: var(--border-light);
    }
    .btn-save {
      background: var(--brand-primary);
      color: white;
    }
    .btn-save:hover {
      background: var(--brand-primary-hover);
    }
  `],
})
export class MetricConfigDrawerComponent {
  @Input() visible = false;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() saved = new EventEmitter<MetricConfigState>();
  @Output() cancelled = new EventEmitter<void>();

  // Device metrics
  deviceMetrics: MetricOption[] = [
    { id: 'cpu', name: 'CPU 使用率', selected: true },
    { id: 'memory', name: '内存使用率', selected: true },
    { id: 'disk-io', name: '磁盘 I/O', selected: true },
    { id: 'disk-read-iops', name: '磁盘读取 IOPS', selected: true },
    { id: 'disk-write-iops', name: '磁盘写入 IOPS', selected: true },
    { id: 'disk-read-latency', name: '磁盘读取延迟', selected: true },
    { id: 'disk-write-latency', name: '磁盘写入延迟', selected: true },
    { id: 'disk-avg-queue', name: '磁盘平均队列长度', selected: true },
  ];

  // App metrics (extended)
  appMetrics: MetricOption[] = [
    { id: 'app-cpu', name: '应用 CPU 使用率', selected: true },
    { id: 'app-memory', name: '应用内存使用率', selected: true },
    { id: 'app-handles', name: '句柄总数', selected: true },
    { id: 'app-processes', name: '进程数量', selected: true },
  ];

  // App selection
  appMode: 'top10' | 'custom' = 'top10';
  top10Metric = 'cpu-memory';

  appTableData: AppTableRow[] = this.generateAppTableData();

  private generateAppTableData(): AppTableRow[] {
    const names = [
      'Chrome', 'VS Code', 'Outlook', 'Microsoft Teams', 'Microsoft Excel',
      'Node.js', 'Docker Desktop', 'Slack', 'Spotify', 'Notion',
      'Figma', 'Postman', 'VS Code Insiders', 'Microsoft Edge', 'Firefox',
    ];
    const ids = [
      'chrome', 'vscode', 'outlook', 'teams', 'excel',
      'node', 'docker', 'slack', 'spotify', 'notion',
      'figma', 'postman', 'vscode-insiders', 'edge', 'firefox',
    ];
    return names.map((name, i) => {
      const cpu = this.randomInt(18, 95);
      const mem = this.randomInt(22, 92);
      return {
        id: ids[i],
        name,
        selected: i < 5,
        cpuUsage: cpu,
        memoryUsage: mem,
        diskIO: this.randomInt(1, 120) + ' MB/s',
        networkIO: this.randomInt(1, 85) + ' KB/s',
        handles: this.randomInt(120, 2800),
        processes: this.randomInt(1, 18),
      };
    });
  }

  private randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  get allDeviceSelected(): boolean {
    return this.deviceMetrics.length > 0 && this.deviceMetrics.every((m) => m.selected);
  }

  get allAppMetricsSelected(): boolean {
    return this.appMetrics.length > 0 && this.appMetrics.every((m) => m.selected);
  }

  get allAppsSelected(): boolean {
    return this.appTableData.length > 0 && this.appTableData.every((a) => a.selected);
  }

  get selectedAppCount(): number {
    return this.appTableData.filter((a) => a.selected).length;
  }

  toggleAllDevice(): void {
    const target = !this.allDeviceSelected;
    this.deviceMetrics.forEach((m) => (m.selected = target));
  }

  toggleAllAppMetrics(): void {
    const target = !this.allAppMetricsSelected;
    this.appMetrics.forEach((m) => (m.selected = target));
  }

  toggleAllApps(): void {
    if (this.allAppsSelected) {
      this.appTableData.forEach((a) => (a.selected = false));
    } else {
      for (let i = 0; i < Math.min(50, this.appTableData.length); i++) {
        this.appTableData[i].selected = true;
      }
    }
  }

  onMetricToggle(): void {
    // purely for model binding, no extra action
  }

  onCancel(): void {
    this.visible = false;
    this.visibleChange.emit(false);
    this.cancelled.emit();
  }

  onSave(): void {
    const config: MetricConfigState = {
      deviceMetrics: this.deviceMetrics.map((m) => ({ ...m })),
      appMetrics: this.appMetrics.map((m) => ({ ...m })),
      appMode: this.appMode,
      availableApps: this.appTableData
        .filter(a => a.selected)
        .map(a => ({ id: a.id, name: a.name, selected: true })),
    };
    this.visible = false;
    this.visibleChange.emit(false);
    this.saved.emit(config);
  }
}