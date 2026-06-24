import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';

interface BreadcrumbItem {
  label: string;
  routerLink?: string;
}

const BREADCRUMB_MAP: Record<string, BreadcrumbItem[]> = {
  '/device-detail': [
    { label: '健康管理' },
    { label: '设备管理' },
    { label: '设备详情' },
  ],
  '/ai-security/overview': [
    { label: 'AI 安全' },
    { label: '总览' },
  ],
  '/ai-security/discovery': [
    { label: 'AI 安全' },
    { label: 'AI 发现' },
  ],
  '/ai-security/visualization': [
    { label: 'AI 安全' },
    { label: 'AI 可视化' },
  ],
  '/ai-security/control': [
    { label: 'AI 安全' },
    { label: 'AI安全管控' },
  ],
  '/ai-security/policy': [
    { label: 'AI 安全' },
    { label: '策略配置' },
  ],
};

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="header">
      <!-- Breadcrumb -->
      <div class="header-breadcrumb">
        <i class="pi pi-desktop breadcrumb-icon"></i>
        @for (item of breadcrumbs; track item.label; let last = $last) {
          @if (!last) {
            <span class="breadcrumb-link">{{ item.label }}</span>
            <i class="pi pi-chevron-right breadcrumb-sep"></i>
          } @else {
            <span class="breadcrumb-current">{{ item.label }}</span>
          }
        }
      </div>

      <!-- Right actions -->
      <div class="header-actions">
        <button class="header-btn" title="搜索">
          <i class="pi pi-search"></i>
        </button>
        <button class="header-btn" title="通知">
          <i class="pi pi-bell"></i>
        </button>
        <div class="header-user">
          <div class="user-avatar">D</div>
          <span class="user-email">dex-agent.user&#64;intellizen.ai</span>
        </div>
      </div>
    </header>
  `,
  styles: [`
    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: var(--header-height);
      padding: 0 24px;
      background: var(--bg-white);
      border-bottom: 1px solid var(--border-light);
    }

    .header-breadcrumb {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
    }

    .breadcrumb-icon {
      color: var(--brand-primary);
      font-size: 16px;
      margin-right: 4px;
    }

    .breadcrumb-link {
      color: var(--text-secondary);
      cursor: pointer;
    }

    .breadcrumb-link:hover {
      color: var(--brand-primary);
    }

    .breadcrumb-sep {
      font-size: 10px;
      color: var(--text-muted);
    }

    .breadcrumb-current {
      color: var(--text-primary);
      font-weight: 500;
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .header-btn {
      width: 36px;
      height: 36px;
      border: none;
      border-radius: var(--radius-md);
      background: transparent;
      color: var(--text-secondary);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      transition: background 0.15s;
    }

    .header-btn:hover {
      background: var(--bg-hover);
      color: var(--text-primary);
    }

    .header-user {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-left: 8px;
      padding-left: 12px;
      border-left: 1px solid var(--border-light);
    }

    .user-avatar {
      width: 30px;
      height: 30px;
      border-radius: 50%;
      background: var(--brand-primary);
      color: white;
      font-size: 13px;
      font-weight: 600;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .user-email {
      font-size: 12px;
      color: var(--text-secondary);
    }
  `]
})
export class HeaderComponent implements OnInit, OnDestroy {
  breadcrumbs: BreadcrumbItem[] = [];

  private routerSub: Subscription | null = null;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.updateBreadcrumb(this.router.url);
    this.routerSub = this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.updateBreadcrumb(event.urlAfterRedirects);
      }
    });
  }

  ngOnDestroy(): void {
    this.routerSub?.unsubscribe();
  }

  private updateBreadcrumb(url: string): void {
    // 去掉 query params 和 fragment
    const path = url.split('?')[0].split('#')[0];
    const items = BREADCRUMB_MAP[path];
    this.breadcrumbs = items || [{ label: '健康管理' }, { label: '设备管理' }, { label: '设备详情' }];
  }
}