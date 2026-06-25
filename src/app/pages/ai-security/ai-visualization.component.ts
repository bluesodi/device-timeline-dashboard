import { Component, ElementRef, ViewChild, AfterViewInit, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { AiDataService, AppNode } from '../../services/ai-data.service';

// ==================== 数据接口 ====================

interface NodeData {
  id: string;
  name: string;
  icon: string;
  column: number;
  type: string;
  category: string;
  connections: number;
  tokenUsage: number;
  status: 'active' | 'inactive';
  lastActive: string;
  allowed: boolean;
}

interface LinkData {
  source: string;
  target: string;
  value: number;
}

interface RenderNode extends NodeData {
  x: number;
  y: number;
  width: number;
  height: number;
  radius: number;
}

interface RenderLink {
  source: RenderNode;
  target: RenderNode;
  value: number;
}

interface StatItem {
  label: string;
  value: string;
  icon: string;
  color: string;
}

interface CollectorRow {
  name: string;
  val1: string;
  val2: string;
  val3: string;
}

// ==================== 颜色常量 ====================

const COLUMN_COLORS: Record<number, string> = {
  0: '#3B82F6',
  1: '#F97316',
  2: '#EF4444',
};

const COLUMN_LABELS: Record<number, string> = {
  0: '设备',
  1: '应用',
  2: 'AI模型',
};

// ==================== 模拟数据 ====================

const DEVICES: NodeData[] = [
  { id: 'd-server', name: 'Server Node', icon: '\u{1F5A5}\uFE0F', column: 0, type: '设备', category: '服务器', connections: 4, tokenUsage: 45200, status: 'active', lastActive: '刚刚', allowed: true },
  { id: 'd-browser', name: 'Web Browser', icon: '\u{1F310}', column: 0, type: '设备', category: '浏览器', connections: 5, tokenUsage: 23100, status: 'active', lastActive: '1分钟前', allowed: true },
  { id: 'd-macbook', name: 'MacBook Pro', icon: '\u{1F4BB}', column: 0, type: '设备', category: '笔记本', connections: 5, tokenUsage: 28900, status: 'active', lastActive: '2分钟前', allowed: true },
  { id: 'd-windows', name: 'Windows PC', icon: '\u{1F5A5}\uFE0F', column: 0, type: '设备', category: '台式机', connections: 5, tokenUsage: 19500, status: 'active', lastActive: '3分钟前', allowed: true },
  { id: 'd-iot', name: 'IoT Gateway', icon: '\u{1F4E1}', column: 0, type: '设备', category: '物联网', connections: 3, tokenUsage: 8700, status: 'active', lastActive: '5分钟前', allowed: true },
  { id: 'd-iphone', name: 'iPhone 15 Pro', icon: '\u{1F4F1}', column: 0, type: '设备', category: '手机', connections: 4, tokenUsage: 11200, status: 'active', lastActive: '4分钟前', allowed: true },
  { id: 'd-ipad', name: 'iPad Pro', icon: '\u{1F4F1}', column: 0, type: '设备', category: '平板', connections: 4, tokenUsage: 9400, status: 'active', lastActive: '6分钟前', allowed: true },
  { id: 'd-android', name: 'Android Pixel', icon: '\u{1F4F1}', column: 0, type: '设备', category: '手机', connections: 4, tokenUsage: 7800, status: 'active', lastActive: '7分钟前', allowed: true },
  { id: 'd-watch', name: 'Smart Watch', icon: '\u{231A}', column: 0, type: '设备', category: '穿戴', connections: 2, tokenUsage: 3200, status: 'inactive', lastActive: '2小时前', allowed: false },
];

const APPS: NodeData[] = [
  { id: 'a-chatgpt', name: 'ChatGPT', icon: '\u{1F916}', column: 1, type: '应用', category: 'AI助手', connections: 2, tokenUsage: 52000, status: 'active', lastActive: '刚刚', allowed: true },
  { id: 'a-chrome', name: 'Chrome', icon: '\u{1F310}', column: 1, type: '应用', category: '浏览器', connections: 3, tokenUsage: 18700, status: 'active', lastActive: '1分钟前', allowed: true },
  { id: 'a-claude', name: 'Claude', icon: '\u{1F916}', column: 1, type: '应用', category: 'AI助手', connections: 1, tokenUsage: 24500, status: 'active', lastActive: '刚刚', allowed: true },
  { id: 'a-midjourney', name: 'Midjourney', icon: '\u{1F3A8}', column: 1, type: '应用', category: '图像生成', connections: 2, tokenUsage: 8300, status: 'active', lastActive: '5分钟前', allowed: true },
  { id: 'a-edge', name: 'Edge', icon: '\u{1F310}', column: 1, type: '应用', category: '浏览器', connections: 2, tokenUsage: 12400, status: 'active', lastActive: '3分钟前', allowed: true },
  { id: 'a-copilot', name: 'GitHub Copilot', icon: '\u{1F4BB}', column: 1, type: '应用', category: '代码助手', connections: 2, tokenUsage: 35200, status: 'active', lastActive: '刚刚', allowed: true },
  { id: 'a-dalle', name: 'DALL-E', icon: '\u{1F3A8}', column: 1, type: '应用', category: '图像生成', connections: 1, tokenUsage: 5200, status: 'active', lastActive: '12分钟前', allowed: true },
  { id: 'a-aistudio', name: 'AI Studio', icon: '\u{1F9E0}', column: 1, type: '应用', category: 'AI平台', connections: 4, tokenUsage: 41000, status: 'active', lastActive: '刚刚', allowed: true },
  { id: 'a-notion', name: 'Notion AI', icon: '\u{1F4DD}', column: 1, type: '应用', category: '笔记', connections: 2, tokenUsage: 9800, status: 'active', lastActive: '4分钟前', allowed: true },
  { id: 'a-wenxin', name: '\u6587\u5FC3\u4E00\u8A00', icon: '\u{1F916}', column: 1, type: '应用', category: 'AI助手', connections: 2, tokenUsage: 15600, status: 'active', lastActive: '2分钟前', allowed: true },
  { id: 'a-ernie', name: 'ERNIE 4.0', icon: '\u{1F916}', column: 1, type: '应用', category: 'AI助手', connections: 2, tokenUsage: 18900, status: 'active', lastActive: '1分钟前', allowed: true },
  { id: 'a-qwen', name: 'Qwen', icon: '\u{1F916}', column: 1, type: '应用', category: 'AI助手', connections: 2, tokenUsage: 11200, status: 'active', lastActive: '6分钟前', allowed: true },
  { id: 'a-xverse', name: 'Xverse', icon: '\u{1F916}', column: 1, type: '应用', category: 'AI助手', connections: 2, tokenUsage: 9400, status: 'inactive', lastActive: '45分钟前', allowed: false },
];

const MODELS: NodeData[] = [
  { id: 'm-gpt4', name: 'GPT-4', icon: '\u{1F9E0}', column: 2, type: '模型', category: '大语言模型', connections: 5, tokenUsage: 78000, status: 'active', lastActive: '刚刚', allowed: true },
  { id: 'm-claude3', name: 'Claude 3', icon: '\u{1F9E0}', column: 2, type: '模型', category: '大语言模型', connections: 4, tokenUsage: 42000, status: 'active', lastActive: '刚刚', allowed: true },
  { id: 'm-gpt35', name: 'GPT-3.5', icon: '\u{1F9E0}', column: 2, type: '模型', category: '大语言模型', connections: 2, tokenUsage: 18500, status: 'active', lastActive: '2分钟前', allowed: true },
  { id: 'm-gemini', name: 'Gemini', icon: '\u{1F9E0}', column: 2, type: '模型', category: '多模态模型', connections: 3, tokenUsage: 28600, status: 'active', lastActive: '1分钟前', allowed: true },
  { id: 'm-starcoder', name: 'StarCoder', icon: '\u{1F4BB}', column: 2, type: '模型', category: '代码模型', connections: 1, tokenUsage: 15200, status: 'active', lastActive: '刚刚', allowed: true },
  { id: 'm-llama3', name: 'LLaMA 3', icon: '\u{1F9E0}', column: 2, type: '模型', category: '大语言模型', connections: 3, tokenUsage: 23400, status: 'active', lastActive: '3分钟前', allowed: true },
  { id: 'm-falcon', name: 'Falcon', icon: '\u{1F9E0}', column: 2, type: '模型', category: '大语言模型', connections: 2, tokenUsage: 11200, status: 'active', lastActive: '5分钟前', allowed: true },
  { id: 'm-mistral', name: 'Mistral', icon: '\u{1F9E0}', column: 2, type: '模型', category: '大语言模型', connections: 2, tokenUsage: 9800, status: 'inactive', lastActive: '30分钟前', allowed: false },
];

const ALL_NODES: NodeData[] = [...DEVICES, ...APPS, ...MODELS];

const MOCK_LINKS: LinkData[] = [
  // 设备 → 应用
  { source: 'd-server', target: 'a-chatgpt', value: 25 },
  { source: 'd-server', target: 'a-claude', value: 20 },
  { source: 'd-server', target: 'a-copilot', value: 30 },
  { source: 'd-server', target: 'a-aistudio', value: 25 },
  { source: 'd-browser', target: 'a-chatgpt', value: 20 },
  { source: 'd-browser', target: 'a-chrome', value: 25 },
  { source: 'd-browser', target: 'a-edge', value: 20 },
  { source: 'd-browser', target: 'a-notion', value: 20 },
  { source: 'd-browser', target: 'a-claude', value: 15 },
  { source: 'd-macbook', target: 'a-chatgpt', value: 22 },
  { source: 'd-macbook', target: 'a-claude', value: 18 },
  { source: 'd-macbook', target: 'a-midjourney', value: 15 },
  { source: 'd-macbook', target: 'a-chrome', value: 20 },
  { source: 'd-macbook', target: 'a-copilot', value: 25 },
  { source: 'd-windows', target: 'a-chatgpt', value: 20 },
  { source: 'd-windows', target: 'a-edge', value: 25 },
  { source: 'd-windows', target: 'a-copilot', value: 25 },
  { source: 'd-windows', target: 'a-aistudio', value: 15 },
  { source: 'd-windows', target: 'a-claude', value: 15 },
  { source: 'd-iot', target: 'a-aistudio', value: 35 },
  { source: 'd-iot', target: 'a-wenxin', value: 35 },
  { source: 'd-iot', target: 'a-ernie', value: 30 },
  { source: 'd-iphone', target: 'a-chatgpt', value: 30 },
  { source: 'd-iphone', target: 'a-claude', value: 25 },
  { source: 'd-iphone', target: 'a-chrome', value: 25 },
  { source: 'd-iphone', target: 'a-notion', value: 20 },
  { source: 'd-ipad', target: 'a-chatgpt', value: 25 },
  { source: 'd-ipad', target: 'a-midjourney', value: 25 },
  { source: 'd-ipad', target: 'a-dalle', value: 25 },
  { source: 'd-ipad', target: 'a-notion', value: 25 },
  { source: 'd-android', target: 'a-claude', value: 30 },
  { source: 'd-android', target: 'a-chrome', value: 25 },
  { source: 'd-android', target: 'a-qwen', value: 25 },
  { source: 'd-android', target: 'a-xverse', value: 20 },
  { source: 'd-watch', target: 'a-wenxin', value: 50 },
  { source: 'd-watch', target: 'a-ernie', value: 50 },
  // 应用 → 模型
  { source: 'a-chatgpt', target: 'm-gpt4', value: 60 },
  { source: 'a-chatgpt', target: 'm-gpt35', value: 40 },
  { source: 'a-claude', target: 'm-claude3', value: 100 },
  { source: 'a-chrome', target: 'm-gpt4', value: 30 },
  { source: 'a-chrome', target: 'm-gemini', value: 35 },
  { source: 'a-chrome', target: 'm-llama3', value: 35 },
  { source: 'a-midjourney', target: 'm-gpt4', value: 50 },
  { source: 'a-midjourney', target: 'm-gemini', value: 50 },
  { source: 'a-edge', target: 'm-gpt4', value: 40 },
  { source: 'a-edge', target: 'm-gemini', value: 60 },
  { source: 'a-copilot', target: 'm-gpt4', value: 50 },
  { source: 'a-copilot', target: 'm-starcoder', value: 50 },
  { source: 'a-dalle', target: 'm-gpt4', value: 100 },
  { source: 'a-aistudio', target: 'm-gpt4', value: 25 },
  { source: 'a-aistudio', target: 'm-claude3', value: 25 },
  { source: 'a-aistudio', target: 'm-gemini', value: 25 },
  { source: 'a-aistudio', target: 'm-llama3', value: 25 },
  { source: 'a-notion', target: 'm-gpt35', value: 50 },
  { source: 'a-notion', target: 'm-claude3', value: 50 },
  { source: 'a-wenxin', target: 'm-llama3', value: 55 },
  { source: 'a-wenxin', target: 'm-falcon', value: 45 },
  { source: 'a-ernie', target: 'm-falcon', value: 50 },
  { source: 'a-ernie', target: 'm-mistral', value: 50 },
  { source: 'a-qwen', target: 'm-llama3', value: 50 },
  { source: 'a-qwen', target: 'm-mistral', value: 50 },
  { source: 'a-xverse', target: 'm-falcon', value: 55 },
  { source: 'a-xverse', target: 'm-mistral', value: 45 },
];

// ==================== 右侧面板数据 ====================

const STATS_DATA: StatItem[] = [
  { label: '设备数', value: '9', icon: '\u{1F5A5}\uFE0F', color: '#3B82F6' },
  { label: '应用数', value: '13', icon: '\u{1F4F1}', color: '#F97316' },
  { label: '模型数', value: '8', icon: '\u{1F9E0}', color: '#EF4444' },
  { label: 'Token数', value: '3', icon: '\u{1F522}', color: '#8B5CF6' },
];

const COLLECTOR_DATA: CollectorRow[] = [
  { name: 'Chrome', val1: '13.65K', val2: '212', val3: '101' },
  { name: 'Edge', val1: '4.19K', val2: '68', val3: '29' },
  { name: 'Application', val1: '3.9K', val2: '64', val3: '41' },
];

// ==================== 组件 ====================

@Component({
  selector: 'app-ai-visualization',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container">
      <!-- ========== 顶部工具栏 ========== -->
      <div class="toolbar">
        <div class="toolbar-left">
          <!-- 视图切换 -->
          <div class="view-toggle-group">
            <button
              class="view-btn"
              [class.active]="currentView === 'sankey'"
              (click)="switchView('sankey')"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="3" width="7" height="7"></rect>
                <rect x="14" y="3" width="7" height="7"></rect>
                <rect x="14" y="14" width="7" height="7"></rect>
                <rect x="3" y="14" width="7" height="7"></rect>
              </svg>
              桑基图
            </button>
            <button
              class="view-btn"
              [class.active]="currentView === 'list'"
              (click)="switchView('list')"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="8" y1="6" x2="21" y2="6"></line>
                <line x1="8" y1="12" x2="21" y2="12"></line>
                <line x1="8" y1="18" x2="21" y2="18"></line>
                <line x1="3" y1="6" x2="3.01" y2="6"></line>
                <line x1="3" y1="12" x2="3.01" y2="12"></line>
                <line x1="3" y1="18" x2="3.01" y2="18"></line>
              </svg>
              列表
            </button>
          </div>

          <!-- 搜索框 -->
          <div class="search-box">
            <svg class="search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input
              type="text"
              class="search-input"
              placeholder="搜索节点..."
              [(ngModel)]="searchQuery"
              (input)="onSearchChange()"
            />
            @if (searchQuery) {
              <button class="search-clear" (click)="clearSearch()">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            }
          </div>

          <!-- 类型筛选 -->
          <select class="type-filter" [(ngModel)]="typeFilter" (change)="onTypeFilterChange()">
            <option value="all">全部类型</option>
            <option value="0">设备</option>
            <option value="1">应用</option>
            <option value="2">模型</option>
          </select>
        </div>

        <div class="toolbar-right">
          <!-- 缩放控制 -->
          <div class="zoom-controls">
            <button class="icon-btn" (click)="zoomOut()" title="缩小">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                <line x1="8" y1="11" x2="14" y2="11"></line>
              </svg>
            </button>
            <button class="icon-btn zoom-label" (click)="zoomReset()" title="恢复">
              <span>{{ Math.round(scale * 100) }}%</span>
            </button>
            <button class="icon-btn" (click)="zoomIn()" title="放大">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                <line x1="11" y1="8" x2="11" y2="14"></line>
                <line x1="8" y1="11" x2="14" y2="11"></line>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- ========== 主体内容 ========== -->
      <div class="content-layout">
        <!-- 左侧主视图 -->
        <div class="main-view">
          @if (currentView === 'sankey') {
            <div class="canvas-card" #canvasContainer>
              <canvas #sankeyCanvas></canvas>
              <!-- 图例 -->
              <div class="canvas-legend">
                @for (entry of legendEntries; track entry.label) {
                  <div class="legend-item">
                    <span class="legend-dot" [style.background-color]="entry.color"></span>
                    <span>{{ entry.label }}</span>
                  </div>
                }
              </div>
              <!-- 空状态提示 -->
              @if (!hasVisibleNodes) {
                <div class="canvas-empty">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                  <span>未找到匹配的节点</span>
                </div>
              }
            </div>
          }
          @if (currentView === 'list') {
            <div class="list-card">
              <div class="filter-tabs">
                @for (tab of filterTabs; track tab.key) {
                  <button
                    class="filter-tab"
                    [class.active]="activeFilter === tab.key"
                    (click)="setFilter(tab.key)"
                  >
                    {{ tab.label }}
                  </button>
                }
              </div>
              <div class="table-wrapper">
                <table class="node-table">
                  <thead>
                    <tr>
                      <th>名称</th>
                      <th>类型</th>
                      <th>分类</th>
                      <th>连接数</th>
                      <th>Token 消耗</th>
                      <th>状态</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (node of filteredNodes; track node.id) {
                      <tr
                        class="table-row"
                        [class.selected]="selectedNode?.id === node.id"
                        (click)="selectNode(node)"
                      >
                        <td>
                          <span class="node-name-cell">
                            <span class="node-color-dot" [style.background-color]="getColumnColor(node.column)"></span>
                            <span class="node-icon-sm">{{ node.icon }}</span>
                            {{ node.name }}
                          </span>
                        </td>
                        <td>
                          <span class="type-badge" [style.background-color]="getColumnColor(node.column) + '20'" [style.color]="getColumnColor(node.column)">
                            {{ node.type }}
                          </span>
                        </td>
                        <td>{{ node.category }}</td>
                        <td>{{ node.connections }}</td>
                        <td>{{ formatToken(node.tokenUsage) }}</td>
                        <td>
                          <span class="status-badge" [class]="node.status">
                            {{ node.status === 'active' ? '活跃' : '未活跃' }}
                          </span>
                        </td>
                      </tr>
                    }
                    @empty {
                      <tr>
                        <td colspan="6" class="table-empty">暂无数据</td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            </div>
          }
        </div>

        <!-- 右侧面板 -->
        <div class="right-panel">
          <!-- 统计概览 -->
          <div class="panel-card stats-card">
            <div class="card-title">统计概览</div>
            <div class="stats-grid">
              @for (stat of statsData; track stat.label) {
                <div class="stat-item">
                  <div class="stat-icon" [style.background-color]="stat.color + '18'" [style.color]="stat.color">
                    {{ stat.icon }}
                  </div>
                  <div class="stat-info">
                    <div class="stat-value">{{ stat.value }}</div>
                    <div class="stat-label">{{ stat.label }}</div>
                  </div>
                </div>
              }
            </div>
          </div>

          <!-- 节点详情 -->
          <div class="panel-card detail-card-wrapper">
            <div class="card-title">节点详情</div>
            @if (selectedNode) {
              <div class="detail-body">
                <div class="detail-node-name">
                  <span class="detail-status-dot" [style.background-color]="selectedNode.status === 'active' ? '#22c55e' : '#ef4444'"></span>
                  <span class="detail-icon">{{ selectedNode.icon }}</span>
                  {{ selectedNode.name }}
                </div>
                <div class="detail-row">
                  <span class="detail-label">类型</span>
                  <span class="detail-value">{{ selectedNode.type }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">分类</span>
                  <span class="detail-value">{{ selectedNode.category }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">连接数</span>
                  <span class="detail-value">{{ selectedNode.connections }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Token 消耗</span>
                  <span class="detail-value">{{ formatToken(selectedNode.tokenUsage) }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">最后活跃</span>
                  <span class="detail-value">{{ selectedNode.lastActive }}</span>
                </div>
                <div class="detail-divider"></div>
                <div class="security-section">
                  <div class="security-title">安全管控</div>
                  <div class="security-row">
                    <span class="security-label">当前状态</span>
                    <span class="security-status" [class.allowed]="selectedNode.allowed" [class.blocked]="!selectedNode.allowed">
                      {{ selectedNode.allowed ? '已允许' : '已禁止' }}
                    </span>
                  </div>
                  <button
                    class="security-toggle-btn"
                    [class.allow]="!selectedNode.allowed"
                    [class.block]="selectedNode.allowed"
                    (click)="toggleSecurity()"
                  >
                    {{ selectedNode.allowed ? '一键禁止' : '一键允许' }}
                  </button>
                </div>
              </div>
            } @else {
              <div class="detail-empty">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M12 16v-4"></path>
                  <path d="M12 8h.01"></path>
                </svg>
                <span>点击节点查看详细信息</span>
              </div>
            }
          </div>

          <!-- 活跃采集器 -->
          <div class="panel-card">
            <div class="card-title">活跃采集器</div>
            <div class="collector-list">
              @for (item of collectorData; track item.name; let i = $index) {
                <div class="collector-row">
                  <div class="collector-left">
                    <span class="collector-index">{{ i + 1 }}</span>
                    <span class="collector-name">{{ item.name }}</span>
                  </div>
                  <div class="collector-right">
                    <span class="collector-stat">{{ item.val1 }}</span>
                    <span class="collector-sep">/</span>
                    <span class="collector-stat">{{ item.val2 }}</span>
                    <span class="collector-sep">/</span>
                    <span class="collector-stat">{{ item.val3 }}</span>
                  </div>
                </div>
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* ==================== CSS 变量（亮色主题） ==================== */
    :host {
      --bg-page: #f0f2f5;
      --bg-card: #ffffff;
      --bg-toolbar: #ffffff;
      --bg-hover: #f3f4f6;
      --bg-input: #f5f7fa;
      --text-primary: #1a1a2e;
      --text-secondary: #4b5563;
      --text-muted: #9ca3af;
      --border: #e5e7eb;
      --border-light: #f3f4f6;
      --shadow-sm: 0 1px 2px rgba(0,0,0,0.04);
      --shadow: 0 1px 3px rgba(0,0,0,0.08);
      --shadow-md: 0 4px 12px rgba(0,0,0,0.06);
      --radius: 8px;
      --radius-sm: 4px;
      --radius-lg: 12px;
      --success: #22c55e;
      --danger: #ef4444;
      --warning: #f59e0b;
      --accent: #3b82f6;
      display: block;
      height: 100%;
    }

    /* ==================== 页面容器 ==================== */
    .page-container {
      padding: 16px 20px;
      background: var(--bg-page);
      height: calc(100vh - 60px);
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      transition: background 0.3s ease;
      overflow: hidden;
    }

    /* ==================== 工具栏 ==================== */
    .toolbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      height: 48px;
      padding: 0 16px;
      background: var(--bg-toolbar);
      border-radius: var(--radius);
      box-shadow: var(--shadow-sm);
      margin-bottom: 12px;
      flex-shrink: 0;
      transition: background 0.3s ease, box-shadow 0.3s ease;
    }

    .toolbar-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .toolbar-right {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    /* 视图切换按钮组 */
    .view-toggle-group {
      display: flex;
      background: var(--bg-input);
      border-radius: 6px;
      padding: 2px;
      gap: 0;
    }

    .view-btn {
      display: flex;
      align-items: center;
      gap: 5px;
      padding: 6px 12px;
      border: none;
      border-radius: 5px;
      font-size: 12px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
      background: transparent;
      color: var(--text-secondary);
      white-space: nowrap;
    }

    .view-btn:hover:not(.active) {
      color: var(--text-primary);
    }

    .view-btn.active {
      background: #ffffff;
      color: var(--accent);
      box-shadow: var(--shadow-sm);
    }

    /* 搜索框 */
    .search-box {
      position: relative;
      display: flex;
      align-items: center;
    }

    .search-icon {
      position: absolute;
      left: 10px;
      color: var(--text-muted);
      pointer-events: none;
    }

    .search-input {
      width: 180px;
      height: 32px;
      padding: 0 32px 0 32px;
      border: 1px solid var(--border);
      border-radius: 6px;
      font-size: 12px;
      background: var(--bg-input);
      color: var(--text-primary);
      outline: none;
      transition: border-color 0.2s ease, width 0.2s ease;
      box-sizing: border-box;
    }

    .search-input:focus {
      border-color: var(--accent);
      width: 220px;
    }

    .search-input::placeholder {
      color: var(--text-muted);
    }

    .search-clear {
      position: absolute;
      right: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 20px;
      height: 20px;
      border: none;
      border-radius: 50%;
      background: transparent;
      color: var(--text-muted);
      cursor: pointer;
      padding: 0;
    }

    .search-clear:hover {
      background: var(--bg-hover);
      color: var(--text-primary);
    }

    /* 类型筛选 */
    .type-filter {
      height: 32px;
      padding: 0 28px 0 10px;
      border: 1px solid var(--border);
      border-radius: 6px;
      font-size: 12px;
      background: var(--bg-input);
      color: var(--text-primary);
      outline: none;
      cursor: pointer;
      appearance: none;
      background-image: url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%239ca3af' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 8px center;
      transition: border-color 0.2s ease;
    }

    .type-filter:focus {
      border-color: var(--accent);
    }

    /* 缩放控件 */
    .zoom-controls {
      display: flex;
      align-items: center;
      gap: 2px;
      background: var(--bg-input);
      border-radius: 6px;
      padding: 2px;
    }

    .icon-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 30px;
      height: 30px;
      border: none;
      border-radius: 5px;
      background: transparent;
      color: var(--text-secondary);
      cursor: pointer;
      transition: all 0.15s ease;
      padding: 0;
    }

    .icon-btn:hover {
      background: var(--bg-hover);
      color: var(--text-primary);
    }

    .zoom-label {
      font-size: 11px;
      font-weight: 500;
      min-width: 42px;
      width: auto;
    }

    /* ==================== 内容布局 ==================== */
    .content-layout {
      display: flex;
      gap: 12px;
      flex: 1;
      min-height: 0;
    }

    .main-view {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
    }

    /* ==================== 桑基图画布 ==================== */
    .canvas-card {
      background: var(--bg-card);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-md);
      flex: 1;
      position: relative;
      overflow: hidden;
      transition: background 0.3s ease;
    }

    .canvas-card canvas {
      width: 100%;
      height: 100%;
      display: block;
    }

    .canvas-legend {
      position: absolute;
      bottom: 12px;
      left: 16px;
      display: flex;
      gap: 16px;
      pointer-events: none;
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 5px;
      font-size: 11px;
      color: var(--text-secondary);
    }

    .legend-dot {
      width: 8px;
      height: 8px;
      border-radius: 2px;
      flex-shrink: 0;
    }

    .canvas-empty {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;
      color: var(--text-muted);
      font-size: 13px;
      pointer-events: none;
    }

    /* ==================== 列表视图 ==================== */
    .list-card {
      background: var(--bg-card);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-md);
      flex: 1;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      transition: background 0.3s ease;
      animation: fadeIn 0.25s ease;
    }

    .filter-tabs {
      display: flex;
      gap: 6px;
      padding: 14px 20px;
      border-bottom: 1px solid var(--border);
      flex-shrink: 0;
    }

    .filter-tab {
      padding: 5px 14px;
      border: none;
      border-radius: var(--radius-sm);
      font-size: 12px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
      background: transparent;
      color: var(--text-secondary);
    }

    .filter-tab:hover:not(.active) {
      color: var(--text-primary);
      background: var(--bg-hover);
    }

    .filter-tab.active {
      background: var(--accent);
      color: #fff;
    }

    .table-wrapper {
      flex: 1;
      overflow: auto;
    }

    .node-table {
      width: 100%;
      border-collapse: collapse;
    }

    .node-table thead {
      position: sticky;
      top: 0;
      z-index: 1;
    }

    .node-table thead th {
      padding: 10px 20px;
      text-align: left;
      font-size: 11px;
      font-weight: 600;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      background: var(--bg-card);
      border-bottom: 1px solid var(--border);
      white-space: nowrap;
    }

    .table-row {
      cursor: pointer;
      transition: background 0.12s ease;
    }

    .table-row:hover {
      background: var(--bg-hover);
    }

    .table-row.selected {
      background: rgba(59, 130, 246, 0.06);
    }

    .table-row td {
      padding: 10px 20px;
      font-size: 13px;
      color: var(--text-primary);
      border-bottom: 1px solid var(--border-light);
      white-space: nowrap;
    }

    .table-empty {
      text-align: center;
      padding: 32px 20px !important;
      color: var(--text-muted);
      font-size: 13px;
    }

    .node-name-cell {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 500;
    }

    .node-color-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      flex-shrink: 0;
    }

    .node-icon-sm {
      font-size: 14px;
      line-height: 1;
    }

    .type-badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 500;
    }

    .status-badge {
      display: inline-block;
      padding: 2px 10px;
      border-radius: 10px;
      font-size: 11px;
      font-weight: 500;
    }

    .status-badge.active {
      background: rgba(34, 197, 94, 0.1);
      color: #22c55e;
    }

    .status-badge.inactive {
      background: rgba(156, 163, 175, 0.1);
      color: #9ca3af;
    }

    /* ==================== 右侧面板 ==================== */
    .right-panel {
      width: 340px;
      flex-shrink: 0;
      display: flex;
      flex-direction: column;
      gap: 12px;
      overflow-y: auto;
      overflow-x: hidden;
    }

    .panel-card {
      background: var(--bg-card);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow);
      padding: 16px;
      transition: background 0.3s ease;
    }

    .card-title {
      font-size: 13px;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 14px;
    }

    /* 统计概览 */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 8px;
    }

    .stat-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      text-align: center;
    }

    .stat-icon {
      width: 36px;
      height: 36px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
    }

    .stat-info {
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .stat-value {
      font-size: 14px;
      font-weight: 700;
      color: var(--text-primary);
      line-height: 1.2;
    }

    .stat-label {
      font-size: 10px;
      color: var(--text-muted);
      line-height: 1.2;
    }

    /* 活跃采集器 */
    .collector-list {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .collector-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
      border-bottom: 1px solid var(--border-light);
    }

    .collector-row:last-child {
      border-bottom: none;
    }

    .collector-left {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .collector-index {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: var(--bg-hover);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
      font-weight: 600;
      color: var(--text-secondary);
    }

    .collector-name {
      font-size: 13px;
      font-weight: 500;
      color: var(--text-primary);
    }

    .collector-right {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .collector-stat {
      font-size: 12px;
      color: var(--text-secondary);
      font-variant-numeric: tabular-nums;
    }

    .collector-sep {
      font-size: 11px;
      color: var(--text-muted);
    }

    /* 节点详情 */
    .detail-card-wrapper {
      flex-shrink: 0;
    }

    .detail-body {
      animation: slideIn 0.25s ease;
    }

    .detail-node-name {
      font-size: 15px;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 14px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .detail-status-dot {
      width: 9px;
      height: 9px;
      border-radius: 50%;
      flex-shrink: 0;
    }

    .detail-icon {
      font-size: 16px;
    }

    .detail-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
      border-bottom: 1px solid var(--border-light);
    }

    .detail-row:last-of-type {
      border-bottom: none;
    }

    .detail-label {
      font-size: 12px;
      color: var(--text-muted);
    }

    .detail-value {
      font-size: 12px;
      color: var(--text-primary);
      font-weight: 500;
    }

    .detail-divider {
      height: 1px;
      background: var(--border);
      margin: 12px 0;
    }

    .security-section {
      margin-top: 2px;
    }

    .security-title {
      font-size: 12px;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 10px;
    }

    .security-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
    }

    .security-label {
      font-size: 12px;
      color: var(--text-muted);
    }

    .security-status {
      display: inline-block;
      padding: 2px 10px;
      border-radius: 10px;
      font-size: 11px;
      font-weight: 500;
    }

    .security-status.allowed {
      background: rgba(34, 197, 94, 0.1);
      color: var(--success);
    }

    .security-status.blocked {
      background: rgba(239, 68, 68, 0.1);
      color: var(--danger);
    }

    .security-toggle-btn {
      width: 100%;
      padding: 7px 16px;
      border: none;
      border-radius: var(--radius-sm);
      font-size: 12px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .security-toggle-btn.allow {
      background: var(--success);
      color: #fff;
    }

    .security-toggle-btn.allow:hover {
      opacity: 0.85;
    }

    .security-toggle-btn.block {
      background: var(--danger);
      color: #fff;
    }

    .security-toggle-btn.block:hover {
      opacity: 0.85;
    }

    .detail-empty {
      padding: 32px 20px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;
      color: var(--text-muted);
      font-size: 12px;
    }

    .detail-empty svg {
      opacity: 0.4;
    }

    /* ==================== 动画 ==================== */
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(4px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @keyframes slideIn {
      from { opacity: 0; transform: translateX(8px); }
      to { opacity: 1; transform: translateX(0); }
    }

    /* ==================== 滚动条 ==================== */
    .right-panel::-webkit-scrollbar,
    .table-wrapper::-webkit-scrollbar {
      width: 5px;
      height: 5px;
    }

    .right-panel::-webkit-scrollbar-track,
    .table-wrapper::-webkit-scrollbar-track {
      background: transparent;
    }

    .right-panel::-webkit-scrollbar-thumb,
    .table-wrapper::-webkit-scrollbar-thumb {
      background: var(--border);
      border-radius: 3px;
    }

    .right-panel::-webkit-scrollbar-thumb:hover,
    .table-wrapper::-webkit-scrollbar-thumb:hover {
      background: var(--text-muted);
    }
  `],
})
export class AiVisualizationComponent implements AfterViewInit, OnInit, OnDestroy {
  @ViewChild('sankeyCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('canvasContainer') canvasContainerRef!: ElementRef<HTMLDivElement>;

  // 暴露 Math 给模板
  Math = Math;

  // ==================== 视图状态 ====================
  currentView: 'sankey' | 'list' = 'sankey';
  selectedNode: NodeData | null = null;
  private preSearchScale = 1;

  // ==================== 搜索与筛选 ====================
  searchQuery = '';
  typeFilter = 'all';
  activeFilter = 'all';

  filterTabs = [
    { key: 'all', label: '全部' },
    { key: '0', label: '设备' },
    { key: '1', label: '应用' },
    { key: '2', label: '模型' },
  ];

  // ==================== 图例 ====================
  legendEntries = [
    { label: '设备', color: '#3B82F6' },
    { label: '应用', color: '#F97316' },
    { label: 'AI模型', color: '#EF4444' },
  ];

  // ==================== 右侧面板数据 ====================
  statsData = STATS_DATA;
  collectorData = COLLECTOR_DATA;

  // ==================== 数据 ====================
  nodes: NodeData[] = [...ALL_NODES];
  links: LinkData[] = [...MOCK_LINKS];
  filteredNodes: NodeData[] = [...ALL_NODES];
  hasVisibleNodes = true;

  // ==================== 桑基图渲染 ====================
  private renderNodes: RenderNode[] = [];
  private renderLinks: RenderLink[] = [];
  private hoveredNodeId: string | null = null;
  private highlightedNodeIds: Set<string> = new Set();

  // 缩放与平移
  scale = 1;
  offsetX = 0;
  offsetY = 0;
  private isPanning = false;
  private panStartX = 0;
  private panStartY = 0;
  private panStartOffsetX = 0;
  private panStartOffsetY = 0;
  private hasMoved = false;
  private readonly MIN_SCALE = 0.5;
  private readonly MAX_SCALE = 3;

  // 布局常量
  private readonly NODE_WIDTH = 140;
  private readonly NODE_RADIUS = 8;
  private readonly MIN_NODE_HEIGHT = 52;
  private readonly MAX_NODE_HEIGHT = 90;
  private readonly PADDING_TOP = 60;
  private readonly PADDING_BOTTOM = 40;
  private readonly PADDING_LEFT = 60;
  private readonly PADDING_RIGHT = 60;

  // 其他
  private resizeObserver: ResizeObserver | null = null;
  private canvasWidth = 0;
  private canvasHeight = 0;
  private dpr = 1;
  private dataSub: Subscription | null = null;

  constructor(private cdr: ChangeDetectorRef, private dataService: AiDataService) {}

  ngOnInit(): void {
    this.dataSub = this.dataService.apps$.subscribe(apps => {
      this.syncAppsFromService(apps);
    });
  }

  private syncAppsFromService(apps: AppNode[]): void {
    // Update the APPS array in place
    for (let i = 0; i < apps.length; i++) {
      const svcApp = apps[i];
      const existing = APPS.find(a => a.id === svcApp.id);
      if (existing) {
        existing.allowed = svcApp.allowed;
        existing.status = svcApp.status;
      }
    }
    // Rebuild ALL_NODES and nodes
    this.nodes = [...DEVICES, ...APPS, ...MODELS];
    this.filteredNodes = [...this.nodes];
    this.updateFilteredNodes();
    if (this.currentView === 'sankey') {
      this.computeLayout();
      this.drawSankey();
    }
  }

  // ==================== 生命周期 ====================

  ngAfterViewInit(): void {
    if (this.currentView === 'sankey') {
      setTimeout(() => this.initSankey(), 50);
    }
  }

  ngOnDestroy(): void {
    this.dataSub?.unsubscribe();
    this.disconnectResizeObserver();
  }

  // ==================== 视图切换 ====================

  switchView(view: 'sankey' | 'list'): void {
    if (this.currentView === view) return;
    this.currentView = view;
    this.cdr.detectChanges();
    if (view === 'sankey') {
      setTimeout(() => this.initSankey(), 50);
    }
  }

  // ==================== 搜索与筛选 ====================

  onSearchChange(): void {
    this.updateFilteredNodes();
    if (this.currentView === 'sankey') {
      this.updateSankeyVisibility();
    }
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.onSearchChange();
  }

  onTypeFilterChange(): void {
    this.updateFilteredNodes();
    if (this.currentView === 'sankey') {
      this.updateSankeyVisibility();
    }
  }

  setFilter(key: string): void {
    this.activeFilter = key;
    this.updateFilteredNodes();
  }

  private updateFilteredNodes(): void {
    let result = [...this.nodes];

    // 搜索过滤
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.trim().toLowerCase();
      result = result.filter(n =>
        n.name.toLowerCase().includes(q) ||
        n.type.toLowerCase().includes(q) ||
        n.category.toLowerCase().includes(q)
      );
    }

    // 类型过滤
    if (this.typeFilter !== 'all') {
      const col = parseInt(this.typeFilter, 10);
      result = result.filter(n => n.column === col);
    }

    // 列表标签过滤
    if (this.activeFilter !== 'all') {
      const col = parseInt(this.activeFilter, 10);
      result = result.filter(n => n.column === col);
    }

    this.filteredNodes = result;
    this.hasVisibleNodes = result.length > 0;
  }

  private updateSankeyVisibility(): void {
    // 搜索/筛选时高亮匹配节点
    if (this.searchQuery.trim() || this.typeFilter !== 'all') {
      const matchingIds = new Set(this.filteredNodes.map(n => n.id));
      this.highlightedNodeIds = matchingIds;
    } else {
      this.highlightedNodeIds.clear();
    }
    this.drawSankey();
  }

  // ==================== 节点选择 ====================

  selectNode(node: NodeData): void {
    this.selectedNode = { ...node };
    if (this.currentView === 'sankey') {
      this.drawSankey();
    }
    this.cdr.detectChanges();
  }

  clearSelection(): void {
    this.selectedNode = null;
    if (this.currentView === 'sankey') {
      this.drawSankey();
    }
    this.cdr.detectChanges();
  }

  toggleSecurity(): void {
    if (!this.selectedNode) return;
    // Only apps (column 1) can be toggled via the shared service
    if (this.selectedNode.column === 1) {
      this.dataService.toggleAllowed(this.selectedNode.id);
    } else {
      // For other node types, toggle locally
      this.selectedNode = { ...this.selectedNode, allowed: !this.selectedNode.allowed };
      const source = this.nodes.find(n => n.id === this.selectedNode!.id);
      if (source) {
        source.allowed = this.selectedNode.allowed;
      }
    }
    this.cdr.detectChanges();
  }

  // ==================== 缩放控制 ====================

  zoomIn(): void {
    this.setScale(Math.min(this.MAX_SCALE, this.scale * 1.25));
  }

  zoomOut(): void {
    this.setScale(Math.max(this.MIN_SCALE, this.scale / 1.25));
  }

  zoomReset(): void {
    this.setScale(1);
  }

  private setScale(newScale: number): void {
    if (!this.canvasRef) return;
    const canvas = this.canvasRef.nativeElement;
    const rect = canvas.getBoundingClientRect();
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    this.zoomAtPoint(cx, cy, newScale);
    this.drawSankey();
  }

  // ==================== 桑基图初始化 ====================

  private initSankey(): void {
    const canvas = this.canvasRef?.nativeElement;
    const container = this.canvasContainerRef?.nativeElement;
    if (!canvas || !container) return;

    this.dpr = window.devicePixelRatio || 1;
    const rect = container.getBoundingClientRect();
    this.canvasWidth = rect.width;
    this.canvasHeight = rect.height;

    canvas.width = this.canvasWidth * this.dpr;
    canvas.height = this.canvasHeight * this.dpr;
    canvas.style.width = this.canvasWidth + 'px';
    canvas.style.height = this.canvasHeight + 'px';

    this.computeLayout();
    this.centerSankey();
    this.drawSankey();
    this.bindCanvasEvents(canvas);
    this.setupResizeObserver(container);
  }

  private setupResizeObserver(container: HTMLElement): void {
    this.disconnectResizeObserver();
    this.resizeObserver = new ResizeObserver(() => {
      const rect = container.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      this.canvasWidth = rect.width;
      this.canvasHeight = rect.height;
      this.dpr = window.devicePixelRatio || 1;
      const canvas = this.canvasRef?.nativeElement;
      if (!canvas) return;
      canvas.width = this.canvasWidth * this.dpr;
      canvas.height = this.canvasHeight * this.dpr;
      canvas.style.width = this.canvasWidth + 'px';
      canvas.style.height = this.canvasHeight + 'px';
      this.computeLayout();
      this.centerSankey();
      this.drawSankey();
    });
    this.resizeObserver.observe(container);
  }

  private disconnectResizeObserver(): void {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
  }

  // ==================== 布局计算 ====================

  private computeLayout(): void {
    const nodeById = new Map<string, NodeData>();
    for (const n of this.nodes) nodeById.set(n.id, n);

    // 计算每个节点的总流量
    const flowMap = new Map<string, number>();
    for (const n of this.nodes) flowMap.set(n.id, 0);
    for (const l of this.links) {
      flowMap.set(l.source, (flowMap.get(l.source) || 0) + l.value);
      flowMap.set(l.target, (flowMap.get(l.target) || 0) + l.value);
    }

    // 按列分组
    const columns: NodeData[][] = [[], [], []];
    for (const n of this.nodes) {
      columns[n.column].push(n);
    }

    const colCount = 3;
    const colGap = (this.canvasWidth - this.PADDING_LEFT - this.PADDING_RIGHT - this.NODE_WIDTH * colCount) / (colCount - 1);
    const availableH = this.canvasHeight - this.PADDING_TOP - this.PADDING_BOTTOM;

    // 计算每列总流量
    const colFlow: number[] = [0, 0, 0];
    for (let c = 0; c < colCount; c++) {
      colFlow[c] = columns[c].reduce((s, n) => s + (flowMap.get(n.id) || 0), 0) || 1;
    }

    // 计算节点高度
    const heightMap = new Map<string, number>();
    for (const n of this.nodes) {
      const flow = flowMap.get(n.id) || 0;
      const colTotal = colFlow[n.column] || 1;
      const ratio = flow / colTotal;
      const h = Math.max(this.MIN_NODE_HEIGHT, Math.min(this.MAX_NODE_HEIGHT, this.MIN_NODE_HEIGHT + ratio * (this.MAX_NODE_HEIGHT - this.MIN_NODE_HEIGHT)));
      heightMap.set(n.id, h);
    }

    // 计算每列节点总高度
    const colNodeH: number[] = [0, 0, 0];
    for (let c = 0; c < colCount; c++) {
      colNodeH[c] = columns[c].reduce((s, n) => s + (heightMap.get(n.id) || 0), 0);
    }

    // 计算节点位置
    this.renderNodes = [];
    for (let c = 0; c < colCount; c++) {
      const x = this.PADDING_LEFT + c * (this.NODE_WIDTH + colGap);
      const totalH = colNodeH[c];
      const totalGap = availableH - totalH;
      const gapCount = columns[c].length + 1;
      const gap = totalGap / Math.max(gapCount, 1);
      let y = this.PADDING_TOP + gap;

      for (const node of columns[c]) {
        const h = heightMap.get(node.id)!;
        this.renderNodes.push({
          ...node,
          x,
          y,
          width: this.NODE_WIDTH,
          height: h,
          radius: this.NODE_RADIUS,
        });
        y += h + gap;
      }
    }

    // 构建渲染连接
    const rNodeMap = new Map<string, RenderNode>();
    for (const rn of this.renderNodes) rNodeMap.set(rn.id, rn);

    this.renderLinks = [];
    for (const link of this.links) {
      const source = rNodeMap.get(link.source);
      const target = rNodeMap.get(link.target);
      if (source && target) {
        this.renderLinks.push({ source, target, value: link.value });
      }
    }
  }

  private centerSankey(): void {
    if (this.renderNodes.length === 0) return;
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (const n of this.renderNodes) {
      minX = Math.min(minX, n.x);
      maxX = Math.max(maxX, n.x + n.width);
      minY = Math.min(minY, n.y);
      maxY = Math.max(maxY, n.y + n.height);
    }
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    this.offsetX = this.canvasWidth / 2 - centerX;
    this.offsetY = this.canvasHeight / 2 - centerY;
    this.scale = 1;
  }

  // ==================== 绘制桑基图 ====================

  private drawSankey(): void {
    const canvas = this.canvasRef?.nativeElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = this.dpr;
    ctx.save();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);

    // 背景
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);

    // 应用缩放和平移
    ctx.save();
    ctx.translate(this.offsetX, this.offsetY);
    ctx.scale(this.scale, this.scale);

    const hasSearch = this.searchQuery.trim().length > 0 || this.typeFilter !== 'all';
    const searchMatchIds = hasSearch ? new Set(this.filteredNodes.map(n => n.id)) : null;
    const isHighlighting = this.hoveredNodeId !== null;

    // 构建上下游集合
    let upstreamIds = new Set<string>();
    let downstreamIds = new Set<string>();
    if (isHighlighting) {
      upstreamIds = this.getUpstreamNodes(this.hoveredNodeId!);
      downstreamIds = this.getDownstreamNodes(this.hoveredNodeId!);
    }

    const relevantIds = new Set<string>();
    if (isHighlighting) {
      relevantIds.add(this.hoveredNodeId!);
      upstreamIds.forEach(id => relevantIds.add(id));
      downstreamIds.forEach(id => relevantIds.add(id));
    }

    // 按列分组 links
    const linksBySourceCol = new Map<string, RenderLink[]>();
    for (const link of this.renderLinks) {
      const key = link.source.id;
      if (!linksBySourceCol.has(key)) linksBySourceCol.set(key, []);
      linksBySourceCol.get(key)!.push(link);
    }

    // 绘制连接线
    const maxLinkValue = Math.max(...this.renderLinks.map(l => l.value), 1);
    const minLineWidth = 2;
    const maxLineWidth = 20;

    for (const link of this.renderLinks) {
      let alpha: number;
      let isHoveredLink = false;

      if (isHighlighting) {
        const isRelevant = link.source.id === this.hoveredNodeId ||
          link.target.id === this.hoveredNodeId ||
          (relevantIds.has(link.source.id) && relevantIds.has(link.target.id));
        alpha = isRelevant ? 0.8 : 0.08;
        isHoveredLink = isRelevant;
      } else if (searchMatchIds) {
        const hasMatch = searchMatchIds.has(link.source.id) || searchMatchIds.has(link.target.id);
        alpha = hasMatch ? 0.5 : 0.06;
      } else {
        alpha = 0.4;
      }

      const lineWidth = minLineWidth + (link.value / maxLinkValue) * (maxLineWidth - minLineWidth);
      const sourceColor = COLUMN_COLORS[link.source.column];
      const targetColor = COLUMN_COLORS[link.target.column];

      // 计算连接在源/目标节点上的 y 位置
      const sourceLinks = linksBySourceCol.get(link.source.id) || [];
      const sourceTotalOut = sourceLinks.reduce((s, l) => s + l.value, 0) || 1;
      let sourceOffset = 0;
      for (const sl of sourceLinks) {
        if (sl === link) break;
        sourceOffset += (sl.value / sourceTotalOut) * link.source.height;
      }

      // 目标流入
      const targetLinks = this.renderLinks.filter(l => l.target.id === link.target.id);
      const targetTotalIn = targetLinks.reduce((s, l) => s + l.value, 0) || 1;
      let targetOffset = 0;
      for (const tl of targetLinks) {
        if (tl === link) break;
        targetOffset += (tl.value / targetTotalIn) * link.target.height;
      }

      const sourceY = link.source.y + sourceOffset + (link.value / sourceTotalOut) * link.source.height * 0.5;
      const targetY = link.target.y + targetOffset + (link.value / targetTotalIn) * link.target.height * 0.5;

      const x0 = link.source.x + link.source.width;
      const x1 = link.target.x;
      const cpOffset = (x1 - x0) * 0.5;

      // 绘制渐变连接线（带阴影）
      ctx.save();
      if (isHoveredLink) {
        ctx.shadowColor = sourceColor;
        ctx.shadowBlur = 12;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
      } else {
        ctx.shadowColor = 'rgba(0,0,0,0.06)';
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 2;
      }

      const gradient = ctx.createLinearGradient(x0, 0, x1, 0);
      gradient.addColorStop(0, this.hexToRgba(sourceColor, alpha));
      gradient.addColorStop(1, this.hexToRgba(targetColor, alpha));

      ctx.beginPath();
      ctx.moveTo(x0, sourceY);
      ctx.bezierCurveTo(x0 + cpOffset, sourceY, x1 - cpOffset, targetY, x1, targetY);
      ctx.strokeStyle = gradient;
      ctx.lineWidth = lineWidth;
      ctx.lineCap = 'round';
      ctx.stroke();
      ctx.restore();
    }

    // 绘制节点
    const selectedId = this.selectedNode?.id;

    for (const node of this.renderNodes) {
      const isHovered = node.id === this.hoveredNodeId;
      const isSelected = node.id === selectedId;

      let nodeAlpha: number;
      if (isHighlighting) {
        nodeAlpha = relevantIds.has(node.id) ? 1 : 0.12;
      } else if (searchMatchIds) {
        nodeAlpha = searchMatchIds.has(node.id) ? 1 : 0.12;
      } else {
        nodeAlpha = 1;
      }

      const color = COLUMN_COLORS[node.column] || '#999';
      const isBlocked = !node.allowed;
      const finalAlpha = nodeAlpha * (isBlocked ? 0.45 : 1);
      const fillColor = isBlocked ? '#9ca3af' : color;
      const darkerColor = this.shadeColor(fillColor, -20);

      const r = this.NODE_RADIUS;
      const x = node.x;
      const y = node.y;
      const w = node.width;
      const h = node.height;
      const cx = x + w / 2;
      const cy = y + h / 2;

      // hover 放大效果
      const scale = isHovered ? 1.05 : 1;
      ctx.save();
      if (isHovered) {
        ctx.translate(cx, cy);
        ctx.scale(scale, scale);
        ctx.translate(-cx, -cy);
      }

      // 选中发光阴影
      if (isSelected && nodeAlpha > 0.5) {
        ctx.save();
        ctx.shadowColor = fillColor;
        ctx.shadowBlur = 24;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        this.roundRect(ctx, x - 3, y - 3, w + 6, h + 6, r + 2);
        ctx.fillStyle = this.hexToRgba(fillColor, 0.15);
        ctx.fill();
        ctx.restore();
      }

      // 节点外发光阴影
      ctx.save();
      ctx.shadowColor = 'rgba(0, 0, 0, 0.12)';
      ctx.shadowBlur = isHovered ? 16 : 8;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = isHovered ? 6 : 3;

      // 圆角矩形背景（渐变填充）
      this.roundRect(ctx, x, y, w, h, r);
      const nodeGradient = ctx.createLinearGradient(x, y, x, y + h);
      nodeGradient.addColorStop(0, this.hexToRgba(fillColor, finalAlpha * 0.95));
      nodeGradient.addColorStop(1, this.hexToRgba(darkerColor, finalAlpha * 0.95));
      ctx.fillStyle = nodeGradient;
      ctx.fill();
      ctx.restore();

      // 节点边框
      ctx.save();
      this.roundRect(ctx, x, y, w, h, r);
      ctx.strokeStyle = this.hexToRgba(isHovered ? '#ffffff' : fillColor, finalAlpha * (isHovered ? 0.9 : 0.7));
      ctx.lineWidth = isHovered ? 2 : 1;
      ctx.stroke();
      ctx.restore();

      // 节点图标和文字
      if (finalAlpha > 0.3) {
        const iconY = cy - 5;
        const textY = cy + 12;

        // 图标
        ctx.fillStyle = `rgba(255, 255, 255, ${finalAlpha})`;
        ctx.font = '16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(node.icon, cx, iconY);

        // 节点名称（带文字阴影描边保证可读性）
        ctx.save();
        ctx.font = 'bold 13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
        ctx.shadowBlur = 3;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 1;
        ctx.fillStyle = `rgba(255, 255, 255, ${finalAlpha})`;
        ctx.fillText(node.name, cx, textY);
        ctx.restore();

        // 类别标签
        ctx.save();
        ctx.font = '10px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = `rgba(255, 255, 255, ${finalAlpha * 0.75})`;
        ctx.fillText(node.category, cx, textY + 14);
        ctx.restore();
      }

      ctx.restore(); // 恢复 hover scale
    }

    ctx.restore(); // 恢复缩放/平移

    // 绘制列标题（固定位置，不受缩放影响）
    this.drawColumnHeaders(ctx);

    ctx.restore();
  }

  private drawColumnHeaders(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    // 使用恒等变换绘制列标题
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

    const headerY = 18;
    const colCount = 3;
    const colGap = (this.canvasWidth - this.PADDING_LEFT - this.PADDING_RIGHT - this.NODE_WIDTH * colCount) / (colCount - 1);

    ctx.font = 'bold 12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    for (let c = 0; c < colCount; c++) {
      const cx = this.PADDING_LEFT + c * (this.NODE_WIDTH + colGap) + this.NODE_WIDTH / 2;
      const screenX = cx * this.scale + this.offsetX;
      if (screenX > -100 && screenX < this.canvasWidth + 100) {
        const color = COLUMN_COLORS[c];
        ctx.fillStyle = color;
        ctx.fillText(COLUMN_LABELS[c].toUpperCase(), screenX, headerY);
      }
    }

    ctx.restore();
  }

  // ==================== Canvas 事件 ====================

  private bindCanvasEvents(canvas: HTMLCanvasElement): void {
    canvas.addEventListener('mousedown', this.onMouseDown);
    canvas.addEventListener('mousemove', this.onMouseMove);
    canvas.addEventListener('mouseup', this.onMouseUp);
    canvas.addEventListener('mouseleave', this.onMouseLeave);
    canvas.addEventListener('wheel', this.onWheel, { passive: false });
    canvas.addEventListener('click', this.onClick);
  }

  private onMouseDown = (event: MouseEvent): void => {
    this.isPanning = true;
    this.hasMoved = false;
    this.panStartX = event.clientX;
    this.panStartY = event.clientY;
    this.panStartOffsetX = this.offsetX;
    this.panStartOffsetY = this.offsetY;
  };

  private onMouseMove = (event: MouseEvent): void => {
    if (this.isPanning) {
      const dx = event.clientX - this.panStartX;
      const dy = event.clientY - this.panStartY;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
        this.hasMoved = true;
      }
      this.offsetX = this.panStartOffsetX + dx;
      this.offsetY = this.panStartOffsetY + dy;
      this.clampOffset();
      this.drawSankey();
      return;
    }

    // 悬停检测
    const canvas = this.canvasRef?.nativeElement;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const sx = event.clientX - rect.left;
    const sy = event.clientY - rect.top;
    const world = this.screenToWorld(sx, sy);
    const hit = this.hitTestNode(world.x, world.y);

    const newHoveredId = hit?.id || null;
    if (newHoveredId !== this.hoveredNodeId) {
      this.hoveredNodeId = newHoveredId;
      canvas.style.cursor = newHoveredId ? 'pointer' : 'grab';
      this.drawSankey();
    }

    if (!this.isPanning) {
      canvas.style.cursor = this.hoveredNodeId ? 'pointer' : 'grab';
    }
  };

  private onMouseUp = (): void => {
    this.isPanning = false;
    const canvas = this.canvasRef?.nativeElement;
    if (canvas && !this.hoveredNodeId) {
      canvas.style.cursor = 'grab';
    }
  };

  private onMouseLeave = (): void => {
    this.isPanning = false;
    if (this.hoveredNodeId) {
      this.hoveredNodeId = null;
      this.drawSankey();
    }
    const canvas = this.canvasRef?.nativeElement;
    if (canvas) {
      canvas.style.cursor = 'default';
    }
  };

  private onClick = (event: MouseEvent): void => {
    if (this.hasMoved) return;

    const canvas = this.canvasRef?.nativeElement;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const sx = event.clientX - rect.left;
    const sy = event.clientY - rect.top;
    const world = this.screenToWorld(sx, sy);
    const hit = this.hitTestNode(world.x, world.y);

    if (hit) {
      this.selectNode(hit);
    } else {
      this.clearSelection();
    }
  };

  private onWheel = (event: WheelEvent): void => {
    event.preventDefault();
    const canvas = this.canvasRef?.nativeElement;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx = event.clientX - rect.left;
    const my = event.clientY - rect.top;

    const delta = event.deltaY > 0 ? -0.1 : 0.1;
    const newScale = Math.max(this.MIN_SCALE, Math.min(this.MAX_SCALE, this.scale * (1 + delta)));
    this.zoomAtPoint(mx, my, newScale);
    this.drawSankey();
  };

  // ==================== 坐标转换 ====================

  private screenToWorld(sx: number, sy: number): { x: number; y: number } {
    return {
      x: (sx - this.offsetX) / this.scale,
      y: (sy - this.offsetY) / this.scale,
    };
  }

  private zoomAtPoint(sx: number, sy: number, newScale: number): void {
    const world = this.screenToWorld(sx, sy);
    this.offsetX = sx - world.x * newScale;
    this.offsetY = sy - world.y * newScale;
    this.scale = newScale;
    this.clampOffset();
  }

  private clampOffset(): void {
    const margin = 200;
    const minOX = -(this.canvasWidth * this.scale) + margin;
    const maxOX = this.canvasWidth - margin;
    const minOY = -(this.canvasHeight * this.scale) + margin;
    const maxOY = this.canvasHeight - margin;
    this.offsetX = Math.max(minOX, Math.min(maxOX, this.offsetX));
    this.offsetY = Math.max(minOY, Math.min(maxOY, this.offsetY));
  }

  // ==================== 命中检测 ====================

  private hitTestNode(wx: number, wy: number): RenderNode | null {
    for (let i = this.renderNodes.length - 1; i >= 0; i--) {
      const n = this.renderNodes[i];
      const padding = 4;
      if (
        wx >= n.x - padding &&
        wx <= n.x + n.width + padding &&
        wy >= n.y - padding &&
        wy <= n.y + n.height + padding
      ) {
        return n;
      }
    }
    return null;
  }

  // ==================== 图遍历（上下游） ====================

  private getUpstreamNodes(nodeId: string): Set<string> {
    const result = new Set<string>();
    const queue = [nodeId];
    const visited = new Set<string>();
    visited.add(nodeId);

    while (queue.length > 0) {
      const current = queue.shift()!;
      for (const link of this.renderLinks) {
        if (link.target.id === current && !visited.has(link.source.id)) {
          visited.add(link.source.id);
          result.add(link.source.id);
          queue.push(link.source.id);
        }
      }
    }
    return result;
  }

  private getDownstreamNodes(nodeId: string): Set<string> {
    const result = new Set<string>();
    const queue = [nodeId];
    const visited = new Set<string>();
    visited.add(nodeId);

    while (queue.length > 0) {
      const current = queue.shift()!;
      for (const link of this.renderLinks) {
        if (link.source.id === current && !visited.has(link.target.id)) {
          visited.add(link.target.id);
          result.add(link.target.id);
          queue.push(link.target.id);
        }
      }
    }
    return result;
  }

  // ==================== 工具方法 ====================

  getColumnColor(column: number): string {
    return COLUMN_COLORS[column] || '#999';
  }

  formatToken(value: number): string {
    if (value >= 10000) {
      return (value / 10000).toFixed(1) + '\u4E07';
    }
    return value.toLocaleString();
  }

  private linkJitter(seed: string): number {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = ((hash << 5) - hash) + seed.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash % 100) / 100; // 0-1 pseudo-random
  }

  private hexToRgba(hex: string, alpha: number): string {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  private shadeColor(hex: string, percent: number): string {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const newR = Math.max(0, Math.min(255, r + (r * percent) / 100));
    const newG = Math.max(0, Math.min(255, g + (g * percent) / 100));
    const newB = Math.max(0, Math.min(255, b + (b * percent) / 100));
    return `rgb(${Math.round(newR)}, ${Math.round(newG)}, ${Math.round(newB)})`;
  }

  private roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
    const radius = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + w - radius, y);
    ctx.arcTo(x + w, y, x + w, y + radius, radius);
    ctx.lineTo(x + w, y + h - radius);
    ctx.arcTo(x + w, y + h, x + w - radius, y + h, radius);
    ctx.lineTo(x + radius, y + h);
    ctx.arcTo(x, y + h, x, y + h - radius, radius);
    ctx.lineTo(x, y + radius);
    ctx.arcTo(x, y, x + radius, y, radius);
    ctx.closePath();
  }
}