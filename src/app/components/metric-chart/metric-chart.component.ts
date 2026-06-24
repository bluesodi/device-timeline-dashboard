import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MetricData } from '../../models/metric-data';

@Component({
  selector: 'app-metric-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="metric-chart-row" [class.alert]="metric.isAlert">
      <!-- Drag handle -->
      <span class="drag-handle" title="拖拽排序">
        <svg width="12" height="16" viewBox="0 0 12 16" fill="currentColor">
          <circle cx="4" cy="3" r="1.5"/>
          <circle cx="8" cy="3" r="1.5"/>
          <circle cx="4" cy="8" r="1.5"/>
          <circle cx="8" cy="8" r="1.5"/>
          <circle cx="4" cy="13" r="1.5"/>
          <circle cx="8" cy="13" r="1.5"/>
        </svg>
      </span>
      <!-- Metric label -->
      <div class="metric-label">
        <span class="metric-name">{{ metric.name }}</span>
        <span class="metric-unit" *ngIf="metric.unit">{{ metric.unit }}</span>
      </div>
      <!-- Chart area -->
      <div class="metric-chart-area">
        <canvas
          #chartCanvas
          class="metric-canvas"
          (click)="onCanvasClick($event)"
        ></canvas>
      </div>
      <!-- Y-axis scale (right side) -->
      <div class="y-axis">
        <span class="y-tick y-tick-max">{{ formatYAxis(yMax) }}</span>
        <span class="y-tick y-tick-mid">{{ formatYAxis(yMid) }}</span>
        <span class="y-tick y-tick-min">0{{ metric.unit }}</span>
      </div>
    </div>
  `,
  styles: [`
    .metric-chart-row {
      display: flex;
      align-items: center;
      height: 60px;
      border-bottom: 1px solid var(--border-light);
      transition: background 0.15s;
    }

    .metric-chart-row:hover {
      background: rgba(124, 58, 237, 0.02);
    }

    .metric-chart-row.alert .metric-name {
      color: var(--danger);
      font-weight: 500;
    }

    .drag-handle {
      width: 24px;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--text-muted);
      font-size: 12px;
      cursor: grab;
      flex-shrink: 0;
      opacity: 0.3;
      transition: opacity 0.15s;
    }

    .metric-chart-row:hover .drag-handle {
      opacity: 1;
    }

    .drag-handle:active {
      cursor: grabbing;
    }

    .metric-label {
      width: 130px;
      flex-shrink: 0;
      padding: 0 8px 0 4px;
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
      color: var(--text-primary);
    }

    .metric-name {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .metric-unit {
      color: var(--text-muted);
      font-size: 11px;
      flex-shrink: 0;
    }

    .metric-chart-area {
      flex: 1;
      height: 44px;
      position: relative;
    }

    .metric-canvas {
      width: 100%;
      height: 100%;
      display: block;
      cursor: pointer;
    }

    /* ===== Y-axis scale (right side) ===== */
    .y-axis {
      width: 42px;
      height: 44px;
      flex-shrink: 0;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      align-items: flex-start;
      padding-left: 6px;
      position: relative;
    }

    .y-axis::before {
      content: '';
      position: absolute;
      left: 0;
      top: 2px;
      bottom: 2px;
      width: 1px;
      background: var(--border-light);
    }

    .y-tick {
      font-size: 10px;
      color: var(--text-muted);
      line-height: 1;
    }
  `]
})
export class MetricChartComponent implements OnChanges {
  @Input() metric!: MetricData;
  @Input() width = 800;

  /** Computed Y-axis max based on actual data (rounded up to nice number) */
  get yMax(): number {
    return this.computeNiceMax(this.metric.points.map(p => p.value));
  }

  get yMid(): number {
    return this.yMax / 2;
  }

  /** Emitted when a bar is clicked. Payload: { metricId, barIndex, point } */
  @Output() barClicked = new EventEmitter<{
    metricId: string;
    metricName: string;
    barIndex: number;
    point: { timestamp: number; value: number };
    unit: string;
  }>();

  constructor(private el: ElementRef) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (this.metric) {
      setTimeout(() => this.drawChart(), 0);
    }
  }

  /** Round max up to a nice number so ticks align with real data */
  private computeNiceMax(values: number[]): number {
    if (!values || values.length === 0) return this.metric.maxValue;
    const actualMax = Math.max(...values);
    if (actualMax <= 0) return this.metric.maxValue;

    // Round up to a nice number (1, 2, 5, 10, 20, 50, 100, 200, 500, 1000...)
    const magnitude = Math.pow(10, Math.floor(Math.log10(actualMax)));
    const normalized = actualMax / magnitude;

    let nice: number;
    if (normalized <= 1) nice = 1;
    else if (normalized <= 2) nice = 2;
    else if (normalized <= 5) nice = 5;
    else nice = 10;

    return nice * magnitude;
  }

  formatYAxis(v: number): string {
    if (Number.isInteger(v)) return String(v) + this.metric.unit;
    return v.toFixed(1) + this.metric.unit;
  }

  onCanvasClick(event: MouseEvent): void {
    const canvas = this.el.nativeElement.querySelector('.metric-canvas') as HTMLCanvasElement;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const w = rect.width;
    const { points } = this.metric;

    const barCount = points.length;
    const chartWidth = w - 4;
    const barGap = chartWidth / barCount;

    const barIndex = Math.floor((x - 2) / barGap);
    if (barIndex < 0 || barIndex >= barCount) return;

    this.barClicked.emit({
      metricId: this.metric.id,
      metricName: this.metric.name,
      barIndex,
      point: points[barIndex],
      unit: this.metric.unit,
    });
  }

  private drawChart(): void {
    const canvas = this.el.nativeElement.querySelector('.metric-canvas') as HTMLCanvasElement;
    if (!canvas) return;

    const container = canvas.parentElement!;
    const w = container.clientWidth;
    const h = container.clientHeight;
    const dpr = window.devicePixelRatio || 1;

    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';

    const ctx = canvas.getContext('2d')!;
    ctx.scale(dpr, dpr);

    const { points } = this.metric;
    const barColor = this.metric.color || '#A78BFA';
    const alertColor = '#EF4444';

    // Use computed nice max for scaling (matches Y-axis ticks)
    const scaleMax = this.yMax;
    const alertThreshold = scaleMax * 0.75;

    const padding = 2;
    const chartWidth = w - padding * 2;
    const chartHeight = h - padding * 2;
    const barCount = points.length;
    const barWidth = Math.max(1, (chartWidth / barCount) * 0.7);
    const barGap = chartWidth / barCount;

    const baseline = chartHeight;

    for (let i = 0; i < barCount; i++) {
      const ratio = points[i].value / scaleMax;
      const barH = Math.max(1, ratio * chartHeight);
      const x = padding + i * barGap;
      const y = baseline - barH;

      const isHigh = points[i].value >= alertThreshold;
      ctx.fillStyle = isHigh ? alertColor : barColor;
      ctx.globalAlpha = isHigh ? 0.85 : 0.55;

      const bw = barWidth;
      const radius = Math.min(1.5, bw / 2);

      ctx.beginPath();
      ctx.moveTo(x, baseline);
      ctx.lineTo(x, y + radius);
      ctx.quadraticCurveTo(x, y, x + radius, y);
      ctx.lineTo(x + bw - radius, y);
      ctx.quadraticCurveTo(x + bw, y, x + bw, y + radius);
      ctx.lineTo(x + bw, baseline);
      ctx.closePath();
      ctx.fill();
    }

    ctx.globalAlpha = 1;
  }
}
