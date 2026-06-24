import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AiDataService, AppNode } from '../../services/ai-data.service';

type FilterStatus = 'all' | 'allowed' | 'blocked';
type FilterType = 'all' | 'AI助手' | 'AI工具' | '浏览器';
type DetailTab = 'overview' | 'users' | 'security';

interface FormData {
  name: string;
  icon: string;
  type: 'AI助手' | 'AI工具' | '浏览器';
  category: string;
}

@Component({
  selector: 'app-ai-control',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container">
      <div class="main-content" [class.has-detail]="selectedApp !== null">
        <!-- 页面标题栏 -->
        <div class="page-header">
          <div class="header-left">
            <h1 class="page-title">AI 安全管控</h1>
            <div class="total-count">{{ filteredApps.length }} 条记录</div>
          </div>
          <button class="btn-add" (click)="openAddModal()">
            <span>+</span>
            新增应用
          </button>
        </div>

        <!-- 筛选栏 -->
        <div class="filter-bar">
          <select class="filter-select" [(ngModel)]="statusFilter">
            <option value="all">全部状态</option>
            <option value="allowed">已允许</option>
            <option value="blocked">已禁止</option>
          </select>

          <select class="filter-select" [(ngModel)]="typeFilter">
            <option value="all">全部类型</option>
            <option value="AI助手">AI助手</option>
            <option value="AI工具">AI工具</option>
            <option value="浏览器">浏览器</option>
          </select>

          <div class="search-box">
            <span class="search-icon">🔍</span>
            <input
              type="text"
              class="search-input"
              [(ngModel)]="searchQuery"
              placeholder="搜索应用名称..."
            />
          </div>

          <div class="batch-actions" *ngIf="selectedIds.size > 0">
            <span class="selected-count">{{ selectedIds.size }} 已选中</span>
            <button class="btn-batch btn-allow" (click)="batchAllow()">
              批量允许
            </button>
            <button class="btn-batch btn-block" (click)="batchBlock()">
              批量禁止
            </button>
            <button class="btn-batch btn-delete" (click)="openBatchDeleteConfirm()">
              批量删除
            </button>
          </div>
        </div>

        <!-- 数据表格 -->
        <div class="table-card">
          <table class="data-table">
            <thead>
              <tr>
                <th width="48">
                  <input
                    type="checkbox"
                    class="checkbox"
                    [checked]="isAllSelected"
                    (change)="toggleSelectAll()"
                  />
                </th>
                <th>应用名称</th>
                <th width="100">类型</th>
                <th width="100">分类</th>
                <th width="80">连接数</th>
                <th width="120">Token消耗</th>
                <th width="100">状态</th>
                <th width="120">操作</th>
              </tr>
            </thead>
            <tbody>
              @for (app of filteredApps; track app.id) {
                <tr
                  [class.selected]="isRowSelected(app.id)"
                  [class.blocked-row]="!app.allowed"
                  (click)="onRowClick(app, $event)"
                >
                  <td>
                    <input
                      type="checkbox"
                      class="checkbox"
                      [checked]="isRowSelected(app.id)"
                      (click)="$event.stopPropagation()"
                      (change)="toggleSelectOne(app.id)"
                    />
                  </td>
                  <td>
                    <div class="app-name-cell">
                      <span class="app-icon">{{ app.icon }}</span>
                      <span class="app-name">{{ app.name }}</span>
                    </div>
                  </td>
                  <td>
                    <span class="type-tag">{{ app.type }}</span>
                  </td>
                  <td>
                    <span class="category-text">{{ app.category }}</span>
                  </td>
                  <td>
                    <span class="connections">{{ app.connections }}</span>
                  </td>
                  <td>
                    <span class="token-usage">{{ formatTokenUsage(app.tokenUsage) }}</span>
                  </td>
                  <td>
                    <div class="status-cell">
                      <span class="status-dot" [class]="app.allowed ? 'allowed' : 'blocked'"></span>
                      <span class="status-text" [class]="app.allowed ? 'allowed' : 'blocked'">
                        {{ app.allowed ? '允许' : '禁止' }}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div class="action-buttons">
                      <button
                        class="btn-toggle"
                        [class]="app.allowed ? 'is-allowed' : 'is-blocked'"
                        (click)="$event.stopPropagation(); toggleStatus(app)"
                      >
                        <span>{{ app.allowed ? '🔒' : '✅' }}</span>
                        {{ app.allowed ? '禁止' : '允许' }}
                      </button>
                      <button
                        class="btn-icon"
                        title="编辑"
                        (click)="$event.stopPropagation(); openEditModal(app)"
                      >
                        ✏️
                      </button>
                      <button
                        class="btn-icon"
                        title="删除"
                        (click)="$event.stopPropagation(); openDeleteConfirm(app)"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="8" class="empty-table">
                    暂无数据
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>

      <!-- 右侧详情面板 -->
      @if (selectedApp) {
        <div class="detail-panel">
          <button class="close-btn" (click)="closeDetail()">✕</button>

          <div class="detail-header">
            <span class="detail-app-icon">{{ selectedApp.icon }}</span>
            <div class="detail-app-info">
              <h2 class="detail-app-name">{{ selectedApp.name }}</h2>
              <span class="detail-status" [class]="selectedApp.allowed ? 'allowed' : 'blocked'">
                <span class="status-dot"></span>
                {{ selectedApp.allowed ? '允许访问' : '禁止访问' }}
              </span>
            </div>
          </div>

          @if (!selectedApp.allowed) {
            <div class="warning-banner">
              <div class="warning-icon">⚠️</div>
              <div class="warning-content">
                <div class="warning-title">建议禁止此应用</div>
                <div class="warning-text">该应用存在数据泄露风险，禁止访问可以降低安全风险</div>
              </div>
            </div>
          }

          <div class="tabs">
            <button
              class="tab-btn"
              [class.active]="activeDetailTab === 'overview'"
              (click)="activeDetailTab = 'overview'"
            >
              概览
            </button>
            <button
              class="tab-btn"
              [class.active]="activeDetailTab === 'users'"
              (click)="activeDetailTab = 'users'"
            >
              用户
            </button>
            <button
              class="tab-btn"
              [class.active]="activeDetailTab === 'security'"
              (click)="activeDetailTab = 'security'"
            >
              安全
            </button>
          </div>

          <div class="tab-content">
            @if (activeDetailTab === 'overview') {
              <div class="overview-content">
                <dl class="property-list">
                  <div class="property-item">
                    <dt>应用名称</dt>
                    <dd>{{ selectedApp.name }}</dd>
                  </div>
                  <div class="property-item">
                    <dt>类型</dt>
                    <dd>{{ selectedApp.type }}</dd>
                  </div>
                  <div class="property-item">
                    <dt>分类</dt>
                    <dd>{{ selectedApp.category }}</dd>
                  </div>
                  <div class="property-item">
                    <dt>当前连接数</dt>
                    <dd>{{ selectedApp.connections }}</dd>
                  </div>
                  <div class="property-item">
                    <dt>Token 消耗</dt>
                    <dd>{{ formatTokenUsage(selectedApp.tokenUsage) }}</dd>
                  </div>
                  <div class="property-item">
                    <dt>首次发现</dt>
                    <dd>2024-01-15</dd>
                  </div>
                  <div class="property-item">
                    <dt>最近活跃</dt>
                    <dd>{{ selectedApp.lastActive }}</dd>
                  </div>
                </dl>
              </div>
            }

            @if (activeDetailTab === 'users') {
              <div class="empty-state">
                <div class="empty-icon">👥</div>
                <p>暂无用户数据</p>
              </div>
            }

            @if (activeDetailTab === 'security') {
              <div class="security-content">
                <div class="security-item">
                  <div class="security-label">管控状态</div>
                  <div class="security-value">
                    {{ selectedApp.allowed ? '允许访问' : '禁止访问' }}
                  </div>
                </div>
                <button
                  class="btn-toggle-security"
                  [class]="selectedApp.allowed ? 'is-allowed' : 'is-blocked'"
                  (click)="toggleStatus(selectedApp)"
                >
                  {{ selectedApp.allowed ? '禁止该应用' : '允许该应用' }}
                </button>
              </div>
            }
          </div>
        </div>
      } @else {
        <div class="detail-panel empty-panel">
          <div class="empty-state">
            <div class="empty-icon">📋</div>
            <p>点击应用查看详情</p>
          </div>
        </div>
      }

      <!-- 新增/编辑模态窗口 -->
      @if (showModal) {
        <div class="modal-overlay" (click)="closeModal()">
          <div class="modal-content" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h3 class="modal-title">{{ editingApp ? '编辑应用' : '新增应用' }}</h3>
            </div>
            <div class="modal-body">
              <div class="form-group">
                <label>应用名称 *</label>
                <input
                  type="text"
                  [(ngModel)]="formData.name"
                  placeholder="请输入应用名称"
                />
              </div>
              <div class="form-group">
                <label>图标 (emoji)</label>
                <input
                  type="text"
                  [(ngModel)]="formData.icon"
                  placeholder="例如: 🤖"
                />
              </div>
              <div class="form-group">
                <label>类型</label>
                <select [(ngModel)]="formData.type">
                  <option value="AI助手">AI助手</option>
                  <option value="AI工具">AI工具</option>
                  <option value="浏览器">浏览器</option>
                </select>
              </div>
              <div class="form-group">
                <label>分类</label>
                <select [(ngModel)]="formData.category">
                  <option value="大语言模型">大语言模型</option>
                  <option value="图像生成">图像生成</option>
                  <option value="代码助手">代码助手</option>
                  <option value="浏览器">浏览器</option>
                  <option value="AI平台">AI平台</option>
                  <option value="笔记">笔记</option>
                </select>
              </div>
            </div>
            <div class="modal-footer">
              <button class="btn-cancel" (click)="closeModal()">取消</button>
              <button class="btn-save" (click)="saveModal()">保存</button>
            </div>
          </div>
        </div>
      }

      <!-- 删除确认对话框 -->
      @if (showConfirmDelete) {
        <div class="modal-overlay" (click)="cancelDelete()">
          <div class="confirm-dialog" (click)="$event.stopPropagation()">
            <div class="confirm-icon">⚠️</div>
            <h3 class="confirm-title">确认删除</h3>
            <p class="confirm-text">
              确定要删除 {{ confirmDeleteApp?.name }} 吗？此操作不可撤销。
            </p>
            <div class="confirm-buttons">
              <button class="btn-cancel" (click)="cancelDelete()">取消</button>
              <button class="btn-confirm-delete" (click)="confirmDelete()">确认删除</button>
            </div>
          </div>
        </div>
      }

      <!-- 批量删除确认对话框 -->
      @if (showBatchDeleteConfirm) {
        <div class="modal-overlay" (click)="cancelBatchDelete()">
          <div class="confirm-dialog" (click)="$event.stopPropagation()">
            <div class="confirm-icon">⚠️</div>
            <h3 class="confirm-title">批量删除确认</h3>
            <p class="confirm-text">
              确定要删除选中的 {{ selectedIds.size }} 个应用吗？此操作不可撤销。
            </p>
            <div class="confirm-buttons">
              <button class="btn-cancel" (click)="cancelBatchDelete()">取消</button>
              <button class="btn-confirm-delete" (click)="confirmBatchDelete()">确认删除</button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
      height: 100%;
    }

    .page-container {
      display: flex;
      padding: 24px;
      background: var(--bg-page);
      min-height: 100%;
      gap: 0;
    }

    .main-content {
      flex: 1;
      min-width: 0;
      transition: all 0.3s ease;
    }

    /* 页面标题栏 */
    .page-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      margin-bottom: 20px;
    }

    .header-left {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .page-title {
      font-size: 18px;
      font-weight: 600;
      color: var(--text-primary);
      margin: 0;
      line-height: 1.4;
    }

    .total-count {
      font-size: 13px;
      color: var(--text-secondary);
    }

    .btn-add {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 10px 20px;
      background: #7c3aed;
      color: #ffffff;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: opacity 0.15s;
    }

    .btn-add:hover {
      opacity: 0.88;
    }

    .btn-add span {
      font-size: 16px;
      line-height: 1;
    }

    /* 筛选栏 */
    .filter-bar {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 16px;
      flex-wrap: wrap;
    }

    .filter-select {
      padding: 8px 12px;
      border: 1px solid var(--border-light, #e5e7eb);
      border-radius: 6px;
      background: var(--bg-white);
      color: var(--text-primary);
      font-size: 13px;
      cursor: pointer;
      outline: none;
      min-width: 120px;
    }

    .filter-select:focus {
      border-color: #7c3aed;
    }

    .search-box {
      position: relative;
      flex: 1;
      max-width: 280px;
    }

    .search-icon {
      position: absolute;
      left: 10px;
      top: 50%;
      transform: translateY(-50%);
      color: var(--text-muted, #9ca3af);
      font-size: 13px;
      pointer-events: none;
    }

    .search-input {
      width: 100%;
      padding: 8px 12px 8px 34px;
      border: 1px solid var(--border-light, #e5e7eb);
      border-radius: 6px;
      background: var(--bg-white);
      color: var(--text-primary);
      font-size: 13px;
      outline: none;
      box-sizing: border-box;
    }

    .search-input:focus {
      border-color: #7c3aed;
    }

    .batch-actions {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-left: auto;
    }

    .selected-count {
      font-size: 13px;
      color: var(--text-secondary);
    }

    .btn-batch {
      padding: 6px 12px;
      border: 1px solid var(--border-light);
      border-radius: 6px;
      font-size: 13px;
      cursor: pointer;
      transition: all 0.15s;
      background: var(--bg-white);
    }

    .btn-batch.btn-allow {
      color: #10B981;
      border-color: #10B981;
    }

    .btn-batch.btn-allow:hover {
      background: #D1FAE5;
    }

    .btn-batch.btn-block {
      color: #EF4444;
      border-color: #EF4444;
    }

    .btn-batch.btn-block:hover {
      background: #FEE2E2;
    }

    .btn-batch.btn-delete {
      color: #EF4444;
      border-color: #EF4444;
    }

    .btn-batch.btn-delete:hover {
      background: #FEE2E2;
    }

    /* 表格卡片 */
    .table-card {
      background: var(--bg-white);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-md);
      overflow: hidden;
    }

    .data-table {
      width: 100%;
      border-collapse: collapse;
    }

    .data-table thead tr {
      background: var(--bg-hover, #f9fafb);
    }

    .data-table th {
      padding: 12px 16px;
      font-size: 13px;
      font-weight: 600;
      color: var(--text-secondary);
      text-align: left;
      white-space: nowrap;
    }

    .data-table td {
      padding: 0 16px;
      height: 56px;
      font-size: 13px;
      color: var(--text-primary);
      vertical-align: middle;
    }

    .data-table tbody tr {
      transition: background 0.15s;
      border-top: 1px solid var(--border-light, #f3f4f6);
    }

    .data-table tbody tr:hover {
      background: var(--bg-hover, #f9fafb);
    }

    .data-table tbody tr.selected {
      background: var(--bg-selected, #f0f4ff);
    }

    .blocked-row {
      opacity: 0.55;
      filter: grayscale(0.5);
    }

    .checkbox {
      width: 18px;
      height: 18px;
      cursor: pointer;
      accent-color: #7c3aed;
    }

    .app-name-cell {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .app-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
      line-height: 1;
    }

    .app-name {
      font-size: 13px;
      font-weight: 600;
      color: var(--text-primary);
    }

    .type-tag {
      display: inline-block;
      padding: 3px 10px;
      background: #f3f4f6;
      border-radius: 4px;
      font-size: 12px;
      color: var(--text-secondary);
    }

    .category-text {
      font-size: 12px;
      color: var(--text-secondary);
    }

    .connections {
      font-variant-numeric: tabular-nums;
    }

    .token-usage {
      font-variant-numeric: tabular-nums;
    }

    .status-cell {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .status-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
    }

    .status-dot.allowed {
      background: #10B981;
    }

    .status-dot.blocked {
      background: #EF4444;
    }

    .status-text {
      font-size: 13px;
      font-weight: 500;
    }

    .status-text.allowed {
      color: #10B981;
    }

    .status-text.blocked {
      color: #EF4444;
    }

    .action-buttons {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .btn-toggle {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 4px 10px;
      border-radius: 6px;
      font-size: 12px;
      cursor: pointer;
      border: none;
      transition: all 0.15s;
    }

    .btn-toggle.is-allowed {
      background: #FDE8E8;
      color: #EF4444;
    }

    .btn-toggle.is-allowed:hover {
      background: #FECACA;
    }

    .btn-toggle.is-blocked {
      background: #D1FAE5;
      color: #10B981;
    }

    .btn-toggle.is-blocked:hover {
      background: #A7F3D0;
    }

    .btn-icon {
      width: 28px;
      height: 28px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border: none;
      background: transparent;
      border-radius: 4px;
      font-size: 14px;
      cursor: pointer;
      transition: background 0.15s;
    }

    .btn-icon:hover {
      background: var(--bg-hover, #f3f4f6);
    }

    .empty-table {
      text-align: center;
      padding: 40px !important;
      color: var(--text-muted);
      font-size: 14px;
    }

    /* 右侧详情面板 */
    .detail-panel {
      width: 340px;
      margin-left: 16px;
      background: var(--bg-white);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-md);
      padding: 20px;
      box-sizing: border-box;
      flex-shrink: 0;
      position: relative;
      max-height: calc(100vh - 48px);
      overflow-y: auto;
    }

    .detail-panel.empty-panel {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .close-btn {
      position: absolute;
      top: 12px;
      right: 12px;
      width: 28px;
      height: 28px;
      border: none;
      background: transparent;
      font-size: 18px;
      color: var(--text-muted);
      cursor: pointer;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      line-height: 1;
    }

    .close-btn:hover {
      background: var(--bg-hover);
    }

    .detail-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 16px;
      padding-top: 8px;
    }

    .detail-app-icon {
      font-size: 24px;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--bg-hover);
      border-radius: 8px;
    }

    .detail-app-info {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .detail-app-name {
      margin: 0;
      font-size: 16px;
      font-weight: 700;
      color: var(--text-primary);
    }

    .detail-status {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
    }

    .detail-status.allowed {
      color: #10B981;
    }

    .detail-status.blocked {
      color: #EF4444;
    }

    .warning-banner {
      display: flex;
      gap: 10px;
      padding: 12px;
      background: #fef2f2;
      border: 1px solid #fecaca;
      border-radius: 8px;
      margin-bottom: 20px;
    }

    .warning-icon {
      font-size: 20px;
      flex-shrink: 0;
    }

    .warning-content {
      flex: 1;
    }

    .warning-title {
      font-size: 13px;
      font-weight: 600;
      color: #b91c1c;
      margin-bottom: 2px;
    }

    .warning-text {
      font-size: 12px;
      color: #ef4444;
    }

    .tabs {
      display: flex;
      gap: 4px;
      border-bottom: 1px solid var(--border-light);
      margin-bottom: 20px;
    }

    .tab-btn {
      flex: 1;
      padding: 10px 0;
      border: none;
      background: transparent;
      font-size: 14px;
      color: var(--text-secondary);
      cursor: pointer;
      border-bottom: 2px solid transparent;
    }

    .tab-btn.active {
      color: #7c3aed;
      border-bottom-color: #7c3aed;
      font-weight: 500;
    }

    .tab-content {
      min-height: 200px;
    }

    .property-list {
      margin: 0;
      padding: 0;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .property-item {
      display: flex;
      justify-content: space-between;
      padding-bottom: 12px;
      border-bottom: 1px solid var(--border-light, #f3f4f6);
    }

    .property-item:last-child {
      border-bottom: none;
      padding-bottom: 0;
    }

    .property-item dt {
      font-size: 13px;
      color: var(--text-secondary);
      font-weight: normal;
    }

    .property-item dd {
      margin: 0;
      font-size: 13px;
      color: var(--text-primary);
      font-weight: 500;
    }

    .security-content {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .security-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .security-label {
      font-size: 13px;
      color: var(--text-secondary);
    }

    .security-value {
      font-size: 14px;
      font-weight: 500;
      color: var(--text-primary);
    }

    .btn-toggle-security {
      width: 100%;
      padding: 12px;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.15s;
    }

    .btn-toggle-security.is-allowed {
      background: #FDE8E8;
      color: #EF4444;
    }

    .btn-toggle-security.is-allowed:hover {
      background: #FECACA;
    }

    .btn-toggle-security.is-blocked {
      background: #D1FAE5;
      color: #10B981;
    }

    .btn-toggle-security.is-blocked:hover {
      background: #A7F3D0;
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px 20px;
      color: var(--text-muted);
    }

    .empty-icon {
      font-size: 48px;
      margin-bottom: 12px;
      opacity: 0.5;
    }

    .empty-state p {
      margin: 0;
      font-size: 14px;
    }

    /* 模态窗口 */
    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.4);
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
      animation: fadeIn 0.2s ease;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .modal-content {
      background: var(--bg-white);
      border-radius: 12px;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
      max-width: 480px;
      width: 90%;
      max-height: 90vh;
      overflow-y: auto;
      animation: slideUp 0.2s ease;
    }

    @keyframes slideUp {
      from {
        transform: translateY(20px);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }

    .modal-header {
      padding: 20px 24px;
      border-bottom: 1px solid var(--border-light, #e5e7eb);
    }

    .modal-title {
      margin: 0;
      font-size: 16px;
      font-weight: 700;
      color: var(--text-primary);
    }

    .modal-body {
      padding: 24px;
    }

    .form-group {
      margin-bottom: 16px;
    }

    .form-group:last-child {
      margin-bottom: 0;
    }

    .form-group label {
      display: block;
      font-size: 13px;
      color: var(--text-secondary);
      margin-bottom: 6px;
    }

    .form-group input,
    .form-group select {
      width: 100%;
      padding: 8px 12px;
      border: 1px solid var(--border-light, #e5e7eb);
      border-radius: 6px;
      font-size: 14px;
      color: var(--text-primary);
      background: var(--bg-white);
      box-sizing: border-box;
      outline: none;
    }

    .form-group input:focus,
    .form-group select:focus {
      border-color: #7c3aed;
    }

    .modal-footer {
      padding: 16px 24px;
      border-top: 1px solid var(--border-light, #e5e7eb);
      display: flex;
      justify-content: flex-end;
      gap: 8px;
    }

    /* 确认对话框 */
    .confirm-dialog {
      background: var(--bg-white);
      border-radius: 12px;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
      max-width: 380px;
      width: 90%;
      padding: 32px 24px 24px;
      text-align: center;
      animation: slideUp 0.2s ease;
      box-sizing: border-box;
    }

    .confirm-icon {
      font-size: 48px;
      margin-bottom: 16px;
    }

    .confirm-title {
      margin: 0 0 8px;
      font-size: 18px;
      font-weight: 600;
      color: var(--text-primary);
    }

    .confirm-text {
      margin: 0 0 24px;
      font-size: 14px;
      color: var(--text-secondary);
      line-height: 1.5;
    }

    .confirm-buttons {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
    }

    .btn-cancel {
      padding: 10px 20px;
      border: 1px solid var(--border-light, #e5e7eb);
      background: var(--bg-white);
      border-radius: 6px;
      font-size: 14px;
      color: var(--text-primary);
      cursor: pointer;
      transition: all 0.15s;
    }

    .btn-cancel:hover {
      background: var(--bg-hover);
    }

    .btn-save {
      padding: 10px 20px;
      border: none;
      background: #7c3aed;
      color: #fff;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: opacity 0.15s;
    }

    .btn-save:hover {
      opacity: 0.88;
    }

    .btn-confirm-delete {
      padding: 10px 20px;
      border: none;
      background: #EF4444;
      color: #fff;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: opacity 0.15s;
    }

    .btn-confirm-delete:hover {
      opacity: 0.88;
    }
  `]
})
export class AiControlComponent implements OnInit {
  apps: AppNode[] = [];
  statusFilter: FilterStatus = 'all';
  typeFilter: FilterType = 'all';
  searchQuery = '';
  selectedIds = new Set<string>();
  selectedApp: AppNode | null = null;
  activeDetailTab: DetailTab = 'overview';

  // 模态窗口状态
  showModal = false;
  editingApp: AppNode | null = null;
  formData: FormData = {
    name: '',
    icon: '🤖',
    type: 'AI助手',
    category: '大语言模型'
  };

  // 删除确认
  showConfirmDelete = false;
  confirmDeleteApp: AppNode | null = null;

  // 批量删除确认
  showBatchDeleteConfirm = false;

  constructor(private aiDataService: AiDataService) {}

  ngOnInit(): void {
    this.aiDataService.apps$.subscribe(apps => {
      this.apps = apps;
    });
  }

  get filteredApps(): AppNode[] {
    return this.apps.filter(app => {
      // 状态筛选
      if (this.statusFilter === 'allowed' && !app.allowed) return false;
      if (this.statusFilter === 'blocked' && app.allowed) return false;

      // 类型筛选
      if (this.typeFilter !== 'all' && app.type !== this.typeFilter) return false;

      // 搜索
      if (this.searchQuery && !app.name.toLowerCase().includes(this.searchQuery.toLowerCase())) {
        return false;
      }

      return true;
    });
  }

  get isAllSelected(): boolean {
    return this.filteredApps.length > 0 && this.filteredApps.every(app => this.selectedIds.has(app.id));
  }

  isRowSelected(id: string): boolean {
    return this.selectedIds.has(id);
  }

  toggleSelectAll(): void {
    if (this.isAllSelected) {
      this.selectedIds.clear();
    } else {
      this.filteredApps.forEach(app => this.selectedIds.add(app.id));
    }
  }

  toggleSelectOne(id: string): void {
    if (this.selectedIds.has(id)) {
      this.selectedIds.delete(id);
    } else {
      this.selectedIds.add(id);
    }
  }

  onRowClick(app: AppNode, event: MouseEvent): void {
    // 支持 Ctrl/Shift 多选（通过复选框，这里点击行只选中单个）
    if (!event.ctrlKey && !event.shiftKey) {
      this.selectedIds.clear();
    }
    this.toggleSelectOne(app.id);
    this.selectedApp = app;
  }

  formatTokenUsage(usage: number): string {
    if (usage > 10000) {
      return (usage / 1000).toFixed(1) + 'K';
    }
    return usage.toString();
  }

  toggleStatus(app: AppNode): void {
    this.aiDataService.toggleAllowed(app.id);
    // 更新选中的详情
    if (this.selectedApp?.id === app.id) {
      this.selectedApp = this.aiDataService.apps.find(a => a.id === app.id) || null;
    }
  }

  batchAllow(): void {
    this.aiDataService.batchToggleAllowed(Array.from(this.selectedIds), true);
    this.selectedIds.clear();
  }

  batchBlock(): void {
    this.aiDataService.batchToggleAllowed(Array.from(this.selectedIds), false);
    this.selectedIds.clear();
  }

  // 新增应用
  openAddModal(): void {
    this.editingApp = null;
    this.formData = {
      name: '',
      icon: '🤖',
      type: 'AI助手',
      category: '大语言模型'
    };
    this.showModal = true;
  }

  // 编辑应用
  openEditModal(app: AppNode): void {
    this.editingApp = app;
    this.formData = {
      name: app.name,
      icon: app.icon,
      type: app.type as any,
      category: app.category
    };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.editingApp = null;
  }

  saveModal(): void {
    if (!this.formData.name.trim()) {
      alert('请输入应用名称');
      return;
    }

    if (this.editingApp) {
      // 编辑
      this.aiDataService.updateApp(this.editingApp.id, {
        name: this.formData.name,
        icon: this.formData.icon,
        type: this.formData.type,
        category: this.formData.category
      });
      // 更新详情
      if (this.selectedApp?.id === this.editingApp.id) {
        this.selectedApp = this.aiDataService.apps.find(a => a.id === this.editingApp!.id) || null;
      }
    } else {
      // 新增
      this.aiDataService.addApp({
        name: this.formData.name,
        icon: this.formData.icon,
        type: this.formData.type,
        category: this.formData.category,
        connections: 0,
        tokenUsage: 0,
        status: 'active',
        lastActive: '刚刚',
        allowed: true
      });
    }

    this.closeModal();
  }

  // 删除
  openDeleteConfirm(app: AppNode): void {
    this.confirmDeleteApp = app;
    this.showConfirmDelete = true;
  }

  cancelDelete(): void {
    this.showConfirmDelete = false;
    this.confirmDeleteApp = null;
  }

  confirmDelete(): void {
    if (this.confirmDeleteApp) {
      if (this.selectedApp?.id === this.confirmDeleteApp.id) {
        this.selectedApp = null;
      }
      this.selectedIds.delete(this.confirmDeleteApp.id);
      this.aiDataService.deleteApp(this.confirmDeleteApp.id);
    }
    this.cancelDelete();
  }

  // 批量删除
  openBatchDeleteConfirm(): void {
    this.showBatchDeleteConfirm = true;
  }

  cancelBatchDelete(): void {
    this.showBatchDeleteConfirm = false;
  }

  confirmBatchDelete(): void {
    this.aiDataService.batchDelete(Array.from(this.selectedIds));
    if (this.selectedApp && this.selectedIds.has(this.selectedApp.id)) {
      this.selectedApp = null;
    }
    this.selectedIds.clear();
    this.showBatchDeleteConfirm = false;
  }

  closeDetail(): void {
    this.selectedApp = null;
  }
}
