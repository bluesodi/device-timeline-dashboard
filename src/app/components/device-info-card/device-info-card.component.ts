import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DeviceInfo } from '../../models/metric-data';

@Component({
  selector: 'app-device-info-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="device-card">
      <div class="card-header">
        <div class="device-title-row">
          <i class="pi pi-desktop device-icon"></i>
          <span class="device-name">{{ device.name }}</span>
        </div>
        <div class="card-actions">
          <button class="action-btn" title="刷新" (click)="onRefresh()">
            <i class="pi pi-refresh"></i>
          </button>
          <button class="action-btn toggle-btn" title="展开更多信息" (click)="toggleExpand()">
            <i class="pi" [class.pi-chevron-down]="!expanded" [class.pi-chevron-up]="expanded"></i>
          </button>
          <div class="more-menu-wrapper">
            <button class="action-btn" title="更多" (click)="toggleMoreMenu()">
              <i class="pi pi-ellipsis-h"></i>
            </button>
            @if (moreMenuOpen) {
              <div class="more-dropdown" (mouseleave)="moreMenuOpen = false">
                <div class="dropdown-item" (click)="onCopy()">
                  <i class="pi pi-copy"></i>
                  <span>复制</span>
                </div>
              </div>
            }
          </div>
        </div>
      </div>

      <!-- Toast -->
      @if (toastVisible) {
        <div class="toast" [class.hide]="toastHiding">
          <i class="pi pi-check-circle toast-icon"></i>
          <span>{{ toastMessage }}</span>
        </div>
      }

      <!-- Base meta row -->
      <div class="card-meta">
        <div class="meta-item">
          <span class="meta-label">设备型号</span>
          <span class="meta-value">{{ device.model }}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">操作系统版本</span>
          <span class="meta-value">{{ device.os }}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">操作系统版本号</span>
          <span class="meta-value">{{ device.osVersion }}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">事件发生时间</span>
          <span class="meta-value">{{ device.eventTime }}</span>
        </div>
      </div>

      <!-- Expandable detail section -->
      @if (expanded && device.detail) {
        <div class="card-detail">
          <div class="detail-divider"></div>
          <div class="card-meta card-meta-detail">
            <div class="meta-item">
              <span class="meta-label">IP 地址</span>
              <span class="meta-value">{{ device.detail.ipAddress }}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">MAC 地址</span>
              <span class="meta-value">{{ device.detail.macAddress }}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">CPU 核心数</span>
              <span class="meta-value">{{ device.detail.cpuCores }}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">总内存</span>
              <span class="meta-value">{{ device.detail.totalMemory }}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">磁盘总量</span>
              <span class="meta-value">{{ device.detail.diskTotal }}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">BIOS 版本</span>
              <span class="meta-value">{{ device.detail.biosVersion }}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">上次启动时间</span>
              <span class="meta-value">{{ device.detail.lastBootTime }}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">Agent 版本</span>
              <span class="meta-value">{{ device.detail.agentVersion }}</span>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .device-card {
      background: var(--bg-white);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-md);
      padding: 20px 24px;
      margin-bottom: 20px;
      transition: box-shadow 0.2s;
      position: relative;
    }

    .card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 16px;
    }

    .device-title-row {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .device-icon {
      font-size: 18px;
      color: var(--brand-primary);
    }

    .device-name {
      font-size: 16px;
      font-weight: 600;
      color: var(--text-primary);
    }

    .card-actions {
      display: flex;
      gap: 4px;
      position: relative;
    }

    .action-btn {
      width: 32px;
      height: 32px;
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

    .action-btn:hover {
      background: var(--bg-hover);
      color: var(--text-primary);
    }

    .toggle-btn:hover {
      color: var(--brand-primary);
      background: var(--brand-primary-light);
    }

    /* ===== More dropdown ===== */
    .more-menu-wrapper {
      position: relative;
    }

    .more-dropdown {
      position: absolute;
      top: calc(100% + 4px);
      right: 0;
      background: var(--bg-white);
      border: 1px solid var(--border-light);
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-md);
      padding: 4px;
      min-width: 120px;
      z-index: 50;
      animation: dropdownIn 0.12s ease;
    }

    .dropdown-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      border-radius: var(--radius-sm);
      font-size: 13px;
      color: var(--text-primary);
      cursor: pointer;
      transition: background 0.12s;
    }

    .dropdown-item:hover {
      background: var(--bg-hover);
    }

    .dropdown-item i {
      font-size: 13px;
      color: var(--text-secondary);
    }

    @keyframes dropdownIn {
      from { opacity: 0; transform: translateY(-4px); }
      to { opacity: 1; transform: translateY(0); }
    }

    /* ===== Toast ===== */
    .toast {
      position: absolute;
      top: 12px;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      background: #10B981;
      color: white;
      border-radius: var(--radius-md);
      font-size: 13px;
      font-weight: 500;
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.25);
      z-index: 60;
      animation: toastIn 0.2s ease;
    }

    .toast.hide {
      animation: toastOut 0.2s ease forwards;
    }

    .toast-icon {
      font-size: 14px;
    }

    @keyframes toastIn {
      from { opacity: 0; transform: translateX(-50%) translateY(-8px); }
      to { opacity: 1; transform: translateX(-50%) translateY(0); }
    }

    @keyframes toastOut {
      from { opacity: 1; transform: translateX(-50%) translateY(0); }
      to { opacity: 0; transform: translateX(-50%) translateY(-8px); }
    }

    .card-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 20px;
    }

    .card-meta-detail {
      padding-top: 4px;
    }

    .meta-item {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .meta-label {
      font-size: 12px;
      color: var(--text-muted);
    }

    .meta-value {
      font-size: 13px;
      color: var(--text-primary);
      font-weight: 500;
    }

    /* Expanded detail section */
    .card-detail {
      animation: expandDown 0.25s ease-out;
    }

    .detail-divider {
      height: 1px;
      background: var(--border-light);
      margin: 16px 0 14px;
    }

    @keyframes expandDown {
      from {
        opacity: 0;
        transform: translateY(-8px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `]
})
export class DeviceInfoCardComponent {
  @Input() device!: DeviceInfo;

  expanded = false;
  moreMenuOpen = false;

  toastVisible = false;
  toastHiding = false;
  toastMessage = '';

  toggleExpand(): void {
    this.expanded = !this.expanded;
  }

  toggleMoreMenu(): void {
    this.moreMenuOpen = !this.moreMenuOpen;
  }

  onRefresh(): void {
    window.location.reload();
  }

  onCopy(): void {
    this.moreMenuOpen = false;

    const text = this.buildCopyText();
    navigator.clipboard.writeText(text).then(() => {
      this.showToast('数据已复制完成');
    }).catch(() => {
      this.showToast('复制失败');
    });
  }

  private buildCopyText(): string {
    const d = this.device;
    let lines = [
      `设备名称: ${d.name}`,
      `设备型号: ${d.model}`,
      `操作系统: ${d.os}`,
      `版本号: ${d.osVersion}`,
      `事件时间: ${d.eventTime}`,
    ];
    if (d.detail) {
      lines.push(
        `IP 地址: ${d.detail.ipAddress}`,
        `MAC 地址: ${d.detail.macAddress}`,
        `CPU: ${d.detail.cpuCores}`,
        `内存: ${d.detail.totalMemory}`,
        `磁盘: ${d.detail.diskTotal}`,
        `BIOS: ${d.detail.biosVersion}`,
        `上次启动: ${d.detail.lastBootTime}`,
        `Agent: ${d.detail.agentVersion}`,
      );
    }
    return lines.join('\n');
  }

  private showToast(message: string): void {
    this.toastMessage = message;
    this.toastVisible = true;
    this.toastHiding = false;

    setTimeout(() => {
      this.toastHiding = true;
      setTimeout(() => {
        this.toastVisible = false;
      }, 200);
    }, 2000);
  }
}