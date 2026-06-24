import { Component, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';

interface DiscoveryStat {
  label: string;
  value: string;
  sublabel: string;
  icon: string;
  color: string;
}

interface DiscoveryItem {
  id: string;
  objectType: 'service' | 'app' | 'capability' | 'data';
  name: string;
  type: string;
  relatedApps: string[];
  discoveredAt: string;
  method: '静态' | '动态';
  status: 'active' | 'inactive';
}

interface TreeNode {
  id: string;
  name: string;
  type: 'app' | 'service' | 'capability' | 'data';
  icon: string;
  children: TreeNode[];
  expanded: boolean;
}

@Component({
  selector: 'app-ai-discovery',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="ai-discovery-page">
      <!-- 页面标题栏 -->
      <div class="page-header">
        <h1 class="page-title">AI 发现</h1>
        <div class="header-subtitle">识别并建立企业完整的 AI 资产清单（AI Asset Inventory）</div>
      </div>

      <!-- ===== 概览统计卡片 ===== -->
      <div class="stat-cards">
        @for (card of statCards; track card.label) {
          <div class="stat-card">
            <div class="stat-icon" [style.background]="card.color + '1A'" [style.color]="card.color">
              <i [class]="card.icon"></i>
            </div>
            <div class="stat-info">
              <div class="stat-label">{{ card.label }}</div>
              <div class="stat-value">{{ card.value }}</div>
              <div class="stat-sublabel">{{ card.sublabel }}</div>
            </div>
          </div>
        }
      </div>

      <!-- ===== 二维框架 + 关联拓扑 ===== -->
      <div class="middle-section">
        <!-- 左侧：关联拓扑图 -->
        <div class="chart-card" style="flex: 6;">
          <div class="card-title">AI Object 关联拓扑</div>
          <div class="desc-text">App 是入口，通过调用 Service 并使用 Capability 来访问 Data</div>
          <div class="topology-wrapper">
            <canvas #topoCanvas></canvas>
          </div>
        </div>

        <!-- 右侧：发现清单概览 -->
        <div class="chart-card" style="flex: 4;">
          <div class="card-title">发现维度</div>
          <div class="dimension-list">
            <div class="dimension-item" *ngFor="let dim of dimensions">
              <div class="dimension-header">
                <span class="dimension-icon" [style.background]="dim.color + '1A'" [style.color]="dim.color">
                  <i [class]="dim.icon"></i>
                </span>
                <div class="dimension-info">
                  <span class="dimension-name">{{ dim.name }}</span>
                  <span class="dimension-count">{{ dim.count }} 项</span>
                </div>
              </div>
              <div class="dimension-desc">{{ dim.desc }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- ===== 发现清单表格 ===== -->
      <div class="table-card">
        <div class="card-title">发现清单</div>
        <div class="table-wrapper">
          <table class="discovery-table">
            <thead>
              <tr>
                <th class="col-object">对象类型</th>
                <th class="col-name">名称</th>
                <th class="col-type">类型</th>
                <th class="col-related">关联应用</th>
                <th class="col-time">发现时间</th>
                <th class="col-method">发现手段</th>
                <th class="col-status">状态</th>
              </tr>
            </thead>
            <tbody>
              @for (item of discoveryItems; track item.id) {
                <tr class="discovery-row">
                  <td class="col-object">
                    <span class="object-tag" [class]="'obj-' + item.objectType">
                      {{ objectTypeLabel(item.objectType) }}
                    </span>
                  </td>
                  <td class="col-name">{{ item.name }}</td>
                  <td class="col-type">{{ item.type }}</td>
                  <td class="col-related">
                    <span class="related-tag" *ngFor="let app of item.relatedApps">{{ app }}</span>
                    <span class="no-related" *ngIf="item.relatedApps.length === 0">—</span>
                  </td>
                  <td class="col-time">{{ item.discoveredAt }}</td>
                  <td class="col-method">
                    <span class="method-tag" [class]="'method-' + item.method">{{ item.method }}</span>
                  </td>
                  <td class="col-status">
                    <span class="status-dot" [class]="'dot-' + item.status"></span>
                    <span>{{ item.status === 'active' ? '活跃' : '发现' }}</span>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .ai-discovery-page {
      padding: 24px;
      background: var(--bg-page);
      min-height: 100%;
    }

    /* ===== 页面标题 ===== */
    .page-header {
      display: flex;
      align-items: baseline;
      gap: 12px;
      margin-bottom: 20px;
    }
    .page-title {
      font-size: 18px;
      font-weight: 600;
      color: var(--text-primary);
      margin: 0;
    }
    .header-subtitle {
      font-size: 13px;
      color: var(--text-muted);
    }

    /* ===== 统计卡片 ===== */
    .stat-cards {
      display: flex;
      gap: 16px;
      margin-bottom: 20px;
    }
    .stat-card {
      background: var(--bg-white);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-md);
      padding: 20px;
      flex: 1;
      display: flex;
      align-items: flex-start;
      gap: 16px;
    }
    .stat-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      flex-shrink: 0;
    }
    .stat-info {
      flex: 1;
    }
    .stat-label {
      font-size: 12px;
      color: var(--text-muted);
      margin-bottom: 4px;
    }
    .stat-value {
      font-size: 22px;
      font-weight: 700;
      color: var(--text-primary);
      line-height: 1.2;
    }
    .stat-sublabel {
      font-size: 11px;
      color: var(--text-muted);
      margin-top: 2px;
    }

    /* ===== 中间两列 ===== */
    .middle-section {
      display: flex;
      gap: 16px;
      margin-bottom: 20px;
    }
    .chart-card {
      background: var(--bg-white);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-md);
      padding: 20px;
    }
    .card-title {
      font-size: 14px;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 8px;
    }
    .desc-text {
      font-size: 12px;
      color: var(--text-muted);
      margin-bottom: 12px;
    }

    /* ===== 拓扑图 ===== */
    .topology-wrapper {
      width: 100%;
      height: 240px;
      position: relative;
    }
    .topology-wrapper canvas {
      width: 100%;
      height: 100%;
    }

    /* ===== 发现维度列表 ===== */
    .dimension-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .dimension-item {
      padding: 12px;
      border: 1px solid var(--border-light);
      border-radius: var(--radius-md);
      transition: background 0.12s;
    }
    .dimension-item:hover {
      background: var(--bg-hover);
    }
    .dimension-header {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 6px;
    }
    .dimension-icon {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      flex-shrink: 0;
    }
    .dimension-info {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .dimension-name {
      font-size: 13px;
      font-weight: 500;
      color: var(--text-primary);
    }
    .dimension-count {
      font-size: 11px;
      color: var(--text-muted);
    }
    .dimension-desc {
      font-size: 12px;
      color: var(--text-muted);
      padding-left: 42px;
    }

    /* ===== 清单表格 ===== */
    .table-card {
      background: var(--bg-white);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-md);
      padding: 20px;
    }
    .table-wrapper {
      overflow-x: auto;
    }
    .discovery-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 12px;
    }
    .discovery-table thead th {
      padding: 8px 10px;
      text-align: left;
      font-weight: 500;
      color: var(--text-muted);
      background: var(--bg-hover);
      border-bottom: 1px solid var(--border-light);
      white-space: nowrap;
    }
    .discovery-table tbody td {
      padding: 8px 10px;
      border-bottom: 1px solid var(--border-light);
      vertical-align: middle;
      white-space: nowrap;
      transition: background 0.12s;
    }
    .discovery-row:hover td {
      background: var(--bg-hover);
    }

    .col-object { width: 90px; }
    .col-name { width: 140px; }
    .col-type { width: 100px; }
    .col-related { width: 160px; }
    .col-time { width: 110px; }
    .col-method { width: 80px; }
    .col-status { width: 70px; }

    /* Object Tag */
    .object-tag {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 500;
    }
    .obj-service { background: #EBF4FF; color: #3B82F6; }
    .obj-app { background: #F3E8FF; color: #8B5CF6; }
    .obj-capability { background: #FFF7ED; color: #F97316; }
    .obj-data { background: #ECFDF5; color: #10B981; }

    /* Related tags */
    .related-tag {
      display: inline-block;
      padding: 1px 6px;
      border-radius: 3px;
      background: var(--bg-hover);
      color: var(--text-secondary);
      font-size: 11px;
      margin-right: 4px;
    }
    .no-related {
      color: var(--text-muted);
    }

    /* Method tag */
    .method-tag {
      display: inline-block;
      padding: 1px 6px;
      border-radius: 3px;
      font-size: 11px;
    }
    .method-静态 { background: #F3E8FF; color: #8B5CF6; }
    .method-动态 { background: #FFF7ED; color: #F97316; }

    /* Status */
    .status-dot {
      display: inline-block;
      width: 6px;
      height: 6px;
      border-radius: 50%;
      margin-right: 4px;
      vertical-align: middle;
    }
    .dot-active { background: #10B981; }
    .dot-inactive { background: #9CA3AF; }
  `],
})
export class AiDiscoveryComponent implements AfterViewInit {
  @ViewChild('topoCanvas') topoCanvas!: ElementRef<HTMLCanvasElement>;

  readonly statCards: DiscoveryStat[] = [
    { label: 'Service 发现', value: '18', sublabel: 'AI 模型与服务', icon: 'pi pi-server', color: '#3B82F6' },
    { label: 'App 发现', value: '24', sublabel: '应用与入口', icon: 'pi pi-window-maximize', color: '#8B5CF6' },
    { label: 'Capability 发现', value: '36', sublabel: '工具与能力', icon: 'pi pi-wrench', color: '#F97316' },
    { label: 'Data 发现', value: '12', sublabel: '数据资产类别', icon: 'pi pi-database', color: '#10B981' },
  ];

  readonly dimensions = [
    {
      name: 'Service Discovery', count: 18, icon: 'pi pi-server', color: '#3B82F6',
      desc: '识别企业正在依赖的 AI 模型与服务，如 ChatGPT、Claude、Gemini、DeepSeek 等'
    },
    {
      name: 'App Discovery', count: 24, icon: 'pi pi-window-maximize', color: '#8B5CF6',
      desc: '识别 AI 进入工作流的客户端入口，如 Cursor、VSCode、Claude Desktop、Notion AI 等'
    },
    {
      name: 'Capability Discovery', count: 36, icon: 'pi pi-wrench', color: '#F97316',
      desc: '识别 AI 被授予的操作能力，如 MCP Server、Filesystem、Terminal、Browser 等'
    },
    {
      name: 'Data Discovery', count: 12, icon: 'pi pi-database', color: '#10B981',
      desc: '识别 AI 可触及的数据资产类别，如源代码、客户数据、财务数据、内部文档等'
    },
  ];

  readonly discoveryItems: DiscoveryItem[] = [
    { id: 's1', objectType: 'service', name: 'ChatGPT', type: '大语言模型', relatedApps: ['Chrome'], discoveredAt: '2026-06-10', method: '静态', status: 'active' },
    { id: 's2', objectType: 'service', name: 'Claude', type: '大语言模型', relatedApps: ['Cursor', 'Claude Desktop'], discoveredAt: '2026-06-10', method: '静态', status: 'active' },
    { id: 's3', objectType: 'service', name: 'Gemini', type: '大语言模型', relatedApps: ['Chrome'], discoveredAt: '2026-06-11', method: '静态', status: 'active' },
    { id: 's4', objectType: 'service', name: 'DeepSeek', type: '大语言模型', relatedApps: ['VS Code'], discoveredAt: '2026-06-12', method: '动态', status: 'active' },
    { id: 's5', objectType: 'service', name: 'OpenAI API', type: 'API 服务', relatedApps: ['VS Code', 'Cursor'], discoveredAt: '2026-06-10', method: '静态', status: 'active' },
    { id: 'a1', objectType: 'app', name: 'Cursor', type: 'IDE', relatedApps: [], discoveredAt: '2026-06-10', method: '静态', status: 'active' },
    { id: 'a2', objectType: 'app', name: 'VS Code', type: 'IDE', relatedApps: [], discoveredAt: '2026-06-10', method: '静态', status: 'active' },
    { id: 'a3', objectType: 'app', name: 'Claude Desktop', type: '桌面应用', relatedApps: [], discoveredAt: '2026-06-11', method: '动态', status: 'active' },
    { id: 'a4', objectType: 'app', name: 'Notion AI', type: '协作工具', relatedApps: [], discoveredAt: '2026-06-10', method: '静态', status: 'active' },
    { id: 'c1', objectType: 'capability', name: 'GitHub MCP', type: 'MCP Server', relatedApps: ['Cursor'], discoveredAt: '2026-06-10', method: '动态', status: 'active' },
    { id: 'c2', objectType: 'capability', name: 'Filesystem', type: 'MCP Tool', relatedApps: ['Cursor', 'VS Code'], discoveredAt: '2026-06-10', method: '动态', status: 'active' },
    { id: 'c3', objectType: 'capability', name: 'Terminal', type: 'MCP Tool', relatedApps: ['Cursor'], discoveredAt: '2026-06-11', method: '动态', status: 'active' },
    { id: 'c4', objectType: 'capability', name: 'Browser', type: 'MCP Tool', relatedApps: ['Claude Desktop'], discoveredAt: '2026-06-12', method: '动态', status: 'active' },
    { id: 'c5', objectType: 'capability', name: 'Jira MCP', type: 'MCP Server', relatedApps: ['Cursor'], discoveredAt: '2026-06-13', method: '动态', status: 'active' },
    { id: 'd1', objectType: 'data', name: '源代码', type: '代码仓库', relatedApps: ['Cursor', 'VS Code'], discoveredAt: '2026-06-10', method: '静态', status: 'active' },
    { id: 'd2', objectType: 'data', name: '客户数据', type: 'CRM 数据', relatedApps: ['Notion AI'], discoveredAt: '2026-06-11', method: '静态', status: 'active' },
    { id: 'd3', objectType: 'data', name: '内部文档', type: '企业知识库', relatedApps: ['Notion AI', 'Cursor'], discoveredAt: '2026-06-11', method: '动态', status: 'active' },
    { id: 'd4', objectType: 'data', name: '财务数据', type: '财务系统', relatedApps: [], discoveredAt: '2026-06-12', method: '静态', status: 'inactive' },
  ];

  readonly treeData: TreeNode[] = [
    {
      id: 'app-cursor', name: 'Cursor', type: 'app', icon: 'pi pi-code',
      expanded: true,
      children: [
        { id: 'svc-claude', name: 'Claude', type: 'service', icon: 'pi pi-cloud', children: [], expanded: false },
        {
          id: 'cap-github', name: 'GitHub MCP', type: 'capability', icon: 'pi pi-github', children: [
            { id: 'data-source', name: '源代码', type: 'data', icon: 'pi pi-file', children: [], expanded: false },
          ], expanded: true
        },
        {
          id: 'cap-fs', name: 'Filesystem', type: 'capability', icon: 'pi pi-folder', children: [
            { id: 'data-source2', name: '源代码', type: 'data', icon: 'pi pi-file', children: [], expanded: false },
            { id: 'data-docs', name: '内部文档', type: 'data', icon: 'pi pi-file', children: [], expanded: false },
          ], expanded: true
        },
        { id: 'cap-terminal', name: 'Terminal', type: 'capability', icon: 'pi pi-terminal', children: [], expanded: false },
        { id: 'cap-jira', name: 'Jira MCP', type: 'capability', icon: 'pi pi-ticket', children: [], expanded: false },
      ]
    },
    {
      id: 'app-vscode', name: 'VS Code', type: 'app', icon: 'pi pi-window-maximize',
      expanded: false,
      children: [
        { id: 'svc-deepseek', name: 'DeepSeek', type: 'service', icon: 'pi pi-cloud', children: [], expanded: false },
        {
          id: 'cap-fs2', name: 'Filesystem', type: 'capability', icon: 'pi pi-folder', children: [
            { id: 'data-source3', name: '源代码', type: 'data', icon: 'pi pi-file', children: [], expanded: false },
          ], expanded: false
        },
      ]
    },
    {
      id: 'app-claude-desktop', name: 'Claude Desktop', type: 'app', icon: 'pi pi-desktop',
      expanded: false,
      children: [
        { id: 'svc-claude2', name: 'Claude', type: 'service', icon: 'pi pi-cloud', children: [], expanded: false },
        { id: 'cap-browser', name: 'Browser', type: 'capability', icon: 'pi pi-globe', children: [], expanded: false },
      ]
    },
  ];

  ngAfterViewInit(): void {
    this.drawTopology();
  }

  private drawTopology(): void {
    const canvas = this.topoCanvas.nativeElement;
    const rect = canvas.parentElement!.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const w = rect.width;
    const h = rect.height;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    const ctx = canvas.getContext('2d')!;
    ctx.scale(dpr, dpr);

    // Draw the four object types in a left-to-right relationship: App → Service
    //                                                          App → Capability → Data

    const cx = w / 2;
    const cy = h / 2;
    const spacingX = 180;
    const spacingY = 60;

    // Positions: App at center-left, Service top-right, Capability bottom-right, Data far-right (below capability)
    const nodes = [
      { id: 'App', x: cx - spacingX, y: cy, r: 32, color: '#8B5CF6', label: 'App' },
      { id: 'Service', x: cx + spacingX, y: cy - spacingY - 10, r: 28, color: '#3B82F6', label: 'Service' },
      { id: 'Capability', x: cx + spacingX, y: cy + spacingY + 10, r: 28, color: '#F97316', label: 'Capability' },
      { id: 'Data', x: cx + spacingX * 2, y: cy + spacingY + 10, r: 24, color: '#10B981', label: 'Data' },
    ];

    // Draw edges
    ctx.save();
    ctx.strokeStyle = '#D1D5DB';
    ctx.lineWidth = 1.5;

    // App → Service
    this.drawArrow(ctx, nodes[0].x + nodes[0].r, nodes[0].y, nodes[1].x - nodes[1].r, nodes[1].y, '调用');
    // App → Capability
    this.drawArrow(ctx, nodes[0].x + nodes[0].r, nodes[0].y, nodes[2].x - nodes[2].r, nodes[2].y, '赋予');
    // Capability → Data
    this.drawArrow(ctx, nodes[2].x + nodes[2].r, nodes[2].y, nodes[3].x - nodes[3].r, nodes[3].y, '访问');

    ctx.restore();

    // Draw nodes
    for (const node of nodes) {
      ctx.save();

      // Glow
      ctx.shadowColor = node.color + '40';
      ctx.shadowBlur = 12;

      ctx.beginPath();
      ctx.arc(node.x, node.y, node.r, 0, Math.PI * 2);
      ctx.fillStyle = node.color + 'E0';
      ctx.fill();

      ctx.shadowBlur = 0;
      ctx.strokeStyle = node.color;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Label
      ctx.fillStyle = '#fff';
      ctx.font = '12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(node.label, node.x, node.y);

      // Sub-label below
      ctx.fillStyle = '#6B7280';
      ctx.font = '10px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillText(node.id === 'App' ? '入口' : node.id === 'Service' ? '模型服务' : node.id === 'Capability' ? '操作能力' : '数据资产', node.x, node.y + node.r + 14);

      ctx.restore();
    }

    // Draw count badges
    const counts: Record<string, number> = { App: 24, Service: 18, Capability: 36, Data: 12 };
    for (const node of nodes) {
      ctx.save();
      const badgeX = node.x + node.r - 6;
      const badgeY = node.y - node.r + 6;
      ctx.beginPath();
      ctx.arc(badgeX, badgeY, 10, 0, Math.PI * 2);
      ctx.fillStyle = '#1F2937';
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.font = '8px -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(counts[node.id]), badgeX, badgeY);
      ctx.restore();
    }
  }

  private drawArrow(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, label: string): void {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const len = Math.sqrt(dx * dx + dy * dy);
    const nx = dx / len;
    const ny = dy / len;

    // Line
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2 - nx * 10, y2 - ny * 10);
    ctx.stroke();

    // Arrowhead
    const arrowSize = 6;
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - nx * arrowSize - ny * arrowSize * 0.5, y2 - ny * arrowSize + nx * arrowSize * 0.5);
    ctx.lineTo(x2 - nx * arrowSize + ny * arrowSize * 0.5, y2 - ny * arrowSize - nx * arrowSize * 0.5);
    ctx.closePath();
    ctx.fillStyle = '#D1D5DB';
    ctx.fill();

    // Label
    const mx = (x1 + x2) / 2;
    const my = (y1 + y2) / 2;
    ctx.fillStyle = '#9CA3AF';
    ctx.font = '9px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText(label, mx + ny * 12, my + nx * 12);
  }

  objectTypeLabel(type: string): string {
    const map: Record<string, string> = {
      service: 'Service',
      app: 'App',
      capability: 'Capability',
      data: 'Data',
    };
    return map[type] || type;
  }
}