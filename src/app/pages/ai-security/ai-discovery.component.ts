import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-ai-discovery',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-container">
      <div class="empty-card">
        <i class="pi pi-search empty-icon"></i>
        <div class="empty-title">AI 发现功能开发中</div>
        <div class="empty-subtitle">即将支持 AI 模型自动发现与识别</div>
      </div>
    </div>
  `,
  styles: [`
    .page-container {
      padding: 24px;
      background: var(--bg-page);
      min-height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .empty-card {
      background: var(--bg-white);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-md);
      padding: 60px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }

    .empty-icon {
      font-size: 48px;
      color: var(--text-muted);
      margin-bottom: 16px;
    }

    .empty-title {
      font-size: 16px;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 8px;
    }

    .empty-subtitle {
      font-size: 14px;
      color: var(--text-muted);
    }
  `],
})
export class AiDiscoveryComponent {}
