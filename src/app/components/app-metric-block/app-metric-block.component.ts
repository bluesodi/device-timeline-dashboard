import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppMetricGroup } from '../../models/metric-data';
import { MetricChartComponent } from '../metric-chart/metric-chart.component';

@Component({
  selector: 'app-metric-block',
  standalone: true,
  imports: [CommonModule, MetricChartComponent],
  template: `
    <div class="app-metric-block" [class.expanded]="group.isExpanded">
      <!-- Header: app name + version + expand toggle -->
      <div class="app-block-header">
        <button class="app-block-toggle" [class.open]="group.isExpanded" (click)="toggle()">
          <i class="pi pi-chevron-down"></i>
        </button>
        <div class="app-block-identity">
          <span class="app-icon">
            <i class="pi pi-window-maximize"></i>
          </span>
          <span class="app-block-name">{{ group.appName }}</span>
        </div>
      </div>

      <!-- Body: metric rows (visible when expanded) -->
      @if (group.isExpanded) {
        <div class="app-block-body">
          @for (metric of group.metrics; track metric.id; let idx = $index) {
            <div
              class="draggable-row"
              draggable="true"
              (dragstart)="onDragStart($event, idx)"
              (dragover)="onDragOver($event, idx)"
              (dragleave)="onDragLeave($event)"
              (drop)="onDrop($event, idx)"
              (dragend)="onDragEnd($event)"
            >
              <app-metric-chart [metric]="metric" (barClicked)="onBarClicked($event)" />
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .app-metric-block {
      border: 1px solid var(--border-light);
      border-radius: var(--radius-md);
      margin-bottom: 12px;
      background: var(--bg-white);
      transition: box-shadow 0.15s;
    }

    .app-metric-block:hover {
      box-shadow: var(--shadow-sm);
    }

    /* ===== Header ===== */
    .app-block-header {
      display: flex;
      align-items: center;
      padding: 12px 16px;
      user-select: none;
    }

    .app-block-identity {
      display: flex;
      align-items: center;
      gap: 8px;
      min-width: 0;
    }

    .app-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      border-radius: var(--radius-sm);
      background: var(--brand-primary-light);
      color: var(--brand-primary);
      font-size: 13px;
      flex-shrink: 0;
    }

    .app-block-name {
      font-size: 14px;
      font-weight: 500;
      color: var(--text-primary);
    }

    .app-block-toggle {
      width: 28px;
      height: 28px;
      border: none;
      border-radius: var(--radius-sm);
      background: transparent;
      color: var(--text-secondary);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      transition: all 0.2s ease;
      flex-shrink: 0;
    }

    .app-block-toggle:hover {
      background: var(--bg-hover);
      color: var(--text-primary);
    }

    .app-block-toggle i {
      transition: transform 0.2s ease;
    }

    .app-block-toggle.open i {
      transform: rotate(180deg);
    }

    /* ===== Body ===== */
    .app-block-body {
      border-top: 1px solid var(--border-light);
      padding: 4px 0;
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
  `],
})
export class AppMetricBlockComponent {
  @Input() group!: AppMetricGroup;
  @Output() barClicked = new EventEmitter<any>();

  private dragIdx = -1;

  toggle(): void {
    this.group.isExpanded = !this.group.isExpanded;
  }

  // === Drag & drop ===

  onDragStart(event: DragEvent, index: number): void {
    this.dragIdx = index;
    (event.target as HTMLElement).classList.add('dragging');
    event.dataTransfer!.effectAllowed = 'move';
    event.dataTransfer!.setData('text/plain', String(index));
  }

  onDragOver(event: DragEvent, index: number): void {
    event.preventDefault();
    event.dataTransfer!.dropEffect = 'move';

    if (this.dragIdx !== index && this.dragIdx >= 0) {
      (event.target as HTMLElement).closest('.draggable-row')?.classList.add('drag-over');
    }
  }

  onDragLeave(event: DragEvent): void {
    const row = (event.target as HTMLElement).closest('.draggable-row');
    if (row) {
      row.classList.remove('drag-over');
    }
  }

  onDrop(event: DragEvent, toIndex: number): void {
    event.preventDefault();
    event.stopPropagation();

    this.removeDragOver();
    if (this.dragIdx < 0 || this.dragIdx === toIndex) {
      return;
    }

    const item = this.group.metrics[this.dragIdx];
    this.group.metrics.splice(this.dragIdx, 1);
    this.group.metrics.splice(toIndex, 0, item);
    this.group.metrics = [...this.group.metrics];
  }

  onDragEnd(event: DragEvent): void {
    (event.target as HTMLElement).classList.remove('dragging');
    this.removeDragOver();
    this.dragIdx = -1;
  }

  private removeDragOver(): void {
    const host = (this as any).el?.nativeElement as HTMLElement;
    const container = host ?? document;
    container.querySelectorAll('.draggable-row.drag-over').forEach((el: Element) => {
      el.classList.remove('drag-over');
    });
  }

  // === Bar click → detail drawer ===
  onBarClicked(data: any): void {
    this.barClicked.emit(data);
  }
}