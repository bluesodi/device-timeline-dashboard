import { Component, OnInit } from '@angular/core';
import { PanelMenuModule } from 'primeng/panelmenu';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [PanelMenuModule],
  template: `
    <aside class="sidebar">
      <!-- Logo -->
      <div class="sidebar-logo">
        <span class="logo-icon">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <rect width="28" height="28" rx="8" fill="url(#logoGrad)"/>
            <defs>
              <linearGradient id="logoGrad" x1="0" y1="0" x2="28" y2="28">
                <stop offset="0%" stop-color="#7C3AED"/>
                <stop offset="100%" stop-color="#A78BFA"/>
              </linearGradient>
            </defs>
          </svg>
        </span>
        <span class="logo-text">intelliZen</span>
      </div>

      <!-- Navigation -->
      <p-panelmenu [model]="menuItems" [multiple]="true" styleClass="sidebar-menu" />
    </aside>
  `,
  styles: [`
    .sidebar {
      width: var(--sidebar-width);
      height: 100vh;
      background: var(--bg-white);
      border-right: 1px solid var(--border-light);
      display: flex;
      flex-direction: column;
      flex-shrink: 0;
      overflow-y: auto;
    }

    .sidebar-logo {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 16px 20px;
      height: 64px;
    }

    .logo-icon {
      display: flex;
      align-items: center;
    }

    .logo-text {
      font-size: 18px;
      font-weight: 700;
      color: var(--brand-primary);
      letter-spacing: -0.3px;
    }

    .sidebar-menu {
      flex: 1;
      padding: 4px 8px;
    }
  `]
})
export class SidebarComponent implements OnInit {
  menuItems: MenuItem[] = [];

  ngOnInit(): void {
    this.menuItems = [
      {
        label: '我的智臻',
        icon: 'pi pi-home',
        routerLink: '/',
      },
      {
        label: '小Zen',
        icon: 'pi pi-microchip-ai',
        routerLink: '/',
      },
      {
        label: '健康管理',
        icon: 'pi pi-wave-pulse',
        expanded: true,
        items: [
          {
            label: '总览',
            icon: 'pi pi-chart-bar',
            routerLink: '/',
          },
          {
            label: '设备管理',
            icon: 'pi pi-desktop',
            routerLink: '/device-detail',
            styleClass: 'active-menu-item',
          },
        ],
      },
      {
        label: 'AI 安全',
        icon: 'pi pi-shield',
        expanded: true,
        items: [
          {
            label: '总览',
            icon: 'pi pi-chart-line',
            routerLink: '/ai-security/overview',
          },
          {
            label: 'AI 发现',
            icon: 'pi pi-search',
            routerLink: '/ai-security/discovery',
          },
          {
            label: 'AI 可视化',
            icon: 'pi pi-sitemap',
            routerLink: '/ai-security/visualization',
          },
          {
            label: 'AI安全管控',
            icon: 'pi pi-lock',
            routerLink: '/ai-security/control',
          },
          {
            label: '策略配置',
            icon: 'pi pi-sliders-h',
            routerLink: '/ai-security/policy',
          },
        ],
      },
      {
        label: '应用管理',
        icon: 'pi pi-th-large',
        routerLink: '/',
      },
      {
        label: '阈值管理',
        icon: 'pi pi-sliders-h',
        routerLink: '/',
      },
      {
        label: '设置',
        icon: 'pi pi-cog',
        expanded: true,
        items: [
          {
            label: '账号设置',
            icon: 'pi pi-user',
            routerLink: '/',
          },
          {
            label: 'Key设置',
            icon: 'pi pi-key',
            routerLink: '/',
          },
        ],
      },
      {
        label: '开发首页',
        icon: 'pi pi-code',
        routerLink: '/',
      },
    ];
  }
}