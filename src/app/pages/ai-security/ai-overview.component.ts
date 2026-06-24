import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';

interface StatCard {
  label: string;
  value: string;
  icon: string;
  color: string;
}

interface RiskUser {
  name: string;
  riskCount: number;
  level: '严重' | '高危' | '中危';
}

interface MaliciousPattern {
  name: string;
  count: number;
  color: string;
}

interface SecurityEvent {
  eventType: string;
  time: string;
  result: string;
  riskType: string;
  operator: string;
  aiTool: string;
  model: string;
}

@Component({
  selector: 'app-ai-overview',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="ai-overview-page">
      <!-- 页面标题栏 -->
      <div class="page-header">
        <h1 class="page-title">AI 安全总览</h1>
        <div class="date-range">
          <i class="pi pi-calendar"></i>
          <span>2026-06-01 ~ 2026-06-22</span>
        </div>
      </div>

      <!-- 顶部统计卡片 -->
      <div class="stat-cards">
        @for (card of statCards; track card.label) {
          <div class="stat-card">
            <div class="stat-icon" [style.background]="card.color + '1A'" [style.color]="card.color">
              <i [class]="card.icon"></i>
            </div>
            <div class="stat-info">
              <div class="stat-label">{{ card.label }}</div>
              <div class="stat-value">{{ card.value }}</div>
            </div>
          </div>
        }
      </div>

      <!-- 中间两列卡片 -->
      <div class="middle-section">
        <!-- 左侧：行为意图风险态势 -->
        <div class="chart-card" style="flex: 5;">
          <div class="card-title">行为意图风险态势</div>
          <div class="risk-overview">
            <div class="risk-big-number">
              <span class="big-value">1,286</span>
              <span class="big-unit">次</span>
            </div>
            <div class="big-desc">行为链分析次数</div>
          </div>
          <div class="trend-section">
            <div class="section-label">恶意模式命中趋势</div>
            <div class="trend-canvas-wrapper">
              <canvas #trendCanvas></canvas>
            </div>
          </div>
          <div class="risk-users-section">
            <div class="section-label">严重风险用户</div>
            <div class="risk-users-list">
              @for (user of riskUsers; track user.name) {
                <div class="risk-user-row">
                  <span class="risk-user-name">{{ user.name }}</span>
                  <span class="risk-user-count">{{ user.riskCount }}次</span>
                  <span class="risk-user-level" [class]="'level-' + user.level">{{ user.level }}</span>
                </div>
              }
            </div>
          </div>
        </div>

        <!-- 右侧：恶意模式分布 -->
        <div class="chart-card" style="flex: 5;">
          <div class="card-title">恶意模式分布</div>
          <div class="doughnut-section">
            <div class="doughnut-canvas-wrapper">
              <canvas #doughnutCanvas></canvas>
              <div class="doughnut-center">
                <div class="center-value">517</div>
                <div class="center-label">总次数</div>
              </div>
            </div>
            <div class="doughnut-legend">
              @for (item of maliciousPatterns; track item.name) {
                <div class="legend-item">
                  <span class="legend-dot" [style.background]="item.color"></span>
                  <span class="legend-name">{{ item.name }}</span>
                  <span class="legend-count">{{ item.count }}</span>
                  <span class="legend-percent">{{ getPercent(item.count) }}%</span>
                </div>
              }
            </div>
          </div>
        </div>
      </div>

      <!-- 底部：最近安全事件 -->
      <div class="events-card">
        <div class="card-title">最近安全事件</div>
        <div class="events-table-wrapper">
          <table class="events-table">
            <thead>
              <tr>
                <th>事件类型</th>
                <th>发现时间</th>
                <th>处置结果</th>
                <th>风险类型</th>
                <th>操作人账号</th>
                <th>AI 工具</th>
                <th>模型</th>
              </tr>
            </thead>
            <tbody>
              @for (event of securityEvents; track event.time + event.operator) {
                <tr>
                  <td>
                    <span class="event-type-tag" [class]="'type-' + event.eventType">{{ event.eventType }}</span>
                  </td>
                  <td>{{ event.time }}</td>
                  <td>
                    <span class="result-tag" [class]="event.result === '阻断' ? 'result-block' : 'result-allow'">
                      <span class="result-dot"></span>
                      {{ event.result }}
                    </span>
                  </td>
                  <td>
                    <span class="risk-type-tag" [class]="'risk-' + event.riskType">{{ event.riskType }}</span>
                  </td>
                  <td>{{ event.operator }}</td>
                  <td>{{ event.aiTool }}</td>
                  <td>{{ event.model }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* ===== 页面容器 ===== */
    .ai-overview-page {
      padding: 24px;
      background: var(--bg-page);
      min-height: 100%;
    }

    /* ===== 页面标题栏 ===== */
    .page-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 20px;
    }

    .page-title {
      font-size: 18px;
      font-weight: 600;
      color: var(--text-primary);
      margin: 0;
    }

    .date-range {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      color: var(--text-secondary);
      background: var(--bg-white);
      border: 1px solid var(--border-light);
      border-radius: var(--radius-lg);
      padding: 6px 14px;
      box-shadow: var(--shadow-md);
    }

    .date-range i {
      font-size: 14px;
      color: var(--brand-primary);
    }

    /* ===== 统计卡片 ===== */
    .stat-cards {
      display: flex;
      gap: 16px;
      margin-bottom: 16px;
    }

    .stat-card {
      flex: 1;
      display: flex;
      align-items: center;
      gap: 16px;
      background: var(--bg-white);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-md);
      padding: 20px;
      transition: transform 0.15s ease;
    }

    .stat-card:hover {
      transform: translateY(-2px);
    }

    .stat-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .stat-icon i {
      font-size: 24px;
    }

    .stat-info {
      display: flex;
      flex-direction: column;
    }

    .stat-label {
      font-size: 12px;
      color: var(--text-muted);
      margin-bottom: 4px;
    }

    .stat-value {
      font-size: 24px;
      font-weight: 700;
      color: var(--text-primary);
      line-height: 1.2;
    }

    /* ===== 中间两列布局 ===== */
    .middle-section {
      display: flex;
      gap: 16px;
      margin-bottom: 16px;
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
      margin-bottom: 16px;
    }

    .section-label {
      font-size: 12px;
      color: var(--text-secondary);
      margin-bottom: 8px;
    }

    /* 行为链分析次数 */
    .risk-overview {
      margin-bottom: 16px;
    }

    .risk-big-number {
      display: flex;
      align-items: baseline;
      gap: 4px;
    }

    .big-value {
      font-size: 28px;
      font-weight: 700;
      color: var(--text-primary);
    }

    .big-unit {
      font-size: 14px;
      color: var(--text-secondary);
    }

    .big-desc {
      font-size: 12px;
      color: var(--text-muted);
      margin-top: 2px;
    }

    /* 趋势图 */
    .trend-section {
      margin-bottom: 16px;
    }

    .trend-canvas-wrapper {
      height: 140px;
      position: relative;
    }

    .trend-canvas-wrapper canvas {
      width: 100%;
      height: 100%;
    }

    /* 严重风险用户 */
    .risk-users-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .risk-user-row {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 13px;
    }

    .risk-user-name {
      flex: 1;
      color: var(--text-primary);
    }

    .risk-user-count {
      color: var(--danger);
      font-weight: 600;
      font-size: 12px;
    }

    .risk-user-level {
      font-size: 11px;
      font-weight: 500;
      padding: 2px 8px;
      border-radius: 10px;
    }

    .level-严重 {
      background: rgba(185, 28, 28, 0.1);
      color: #B91C1C;
    }

    .level-高危 {
      background: rgba(239, 68, 68, 0.1);
      color: #EF4444;
    }

    .level-中危 {
      background: rgba(249, 115, 22, 0.1);
      color: #F97316;
    }

    /* ===== 恶意模式分布 ===== */
    .doughnut-section {
      display: flex;
      align-items: center;
      gap: 20px;
    }

    .doughnut-canvas-wrapper {
      position: relative;
      width: 180px;
      height: 180px;
      flex-shrink: 0;
    }

    .doughnut-canvas-wrapper canvas {
      width: 100%;
      height: 100%;
    }

    .doughnut-center {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      text-align: center;
      pointer-events: none;
    }

    .center-value {
      font-size: 22px;
      font-weight: 700;
      color: var(--text-primary);
      line-height: 1.2;
    }

    .center-label {
      font-size: 11px;
      color: var(--text-muted);
    }

    .doughnut-legend {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 12px;
    }

    .legend-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      flex-shrink: 0;
    }

    .legend-name {
      flex: 1;
      color: var(--text-primary);
    }

    .legend-count {
      color: var(--text-secondary);
      font-weight: 500;
      min-width: 32px;
      text-align: right;
    }

    .legend-percent {
      color: var(--text-muted);
      min-width: 36px;
      text-align: right;
    }

    /* ===== 底部安全事件 ===== */
    .events-card {
      background: var(--bg-white);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-md);
      padding: 20px;
    }

    .events-table-wrapper {
      overflow-x: auto;
    }

    .events-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;
    }

    .events-table thead th {
      text-align: left;
      padding: 0 12px;
      height: 40px;
      font-weight: 600;
      color: var(--text-secondary);
      background: var(--bg-hover);
      border-bottom: 1px solid var(--border-light);
      white-space: nowrap;
    }

    .events-table thead th:first-child {
      border-radius: var(--radius-lg) 0 0 0;
    }

    .events-table thead th:last-child {
      border-radius: 0 var(--radius-lg) 0 0;
    }

    .events-table tbody td {
      padding: 0 12px;
      height: 48px;
      color: var(--text-primary);
      border-bottom: 1px solid var(--border-light);
      white-space: nowrap;
    }

    .events-table tbody tr:last-child td {
      border-bottom: none;
    }

    .events-table tbody tr:hover {
      background: var(--bg-hover);
    }

    /* 事件类型标签 */
    .event-type-tag {
      display: inline-block;
      padding: 2px 10px;
      border-radius: 10px;
      font-size: 12px;
      font-weight: 500;
      color: #fff;
    }

    .type-泄密 {
      background: #EF4444;
    }

    .type-不合规 {
      background: #F97316;
    }

    .type-敏感 {
      background: #EAB308;
    }

    .type-恶意 {
      background: #B91C1C;
    }

    /* 处置结果标签 */
    .result-tag {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      font-weight: 500;
    }

    .result-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      display: inline-block;
    }

    .result-block {
      color: #EF4444;
    }

    .result-block .result-dot {
      background: #EF4444;
    }

    .result-allow {
      color: #10B981;
    }

    .result-allow .result-dot {
      background: #10B981;
    }

    /* 风险类型标签 */
    .risk-type-tag {
      display: inline-block;
      padding: 2px 10px;
      border-radius: 10px;
      font-size: 12px;
      font-weight: 500;
      color: #fff;
    }

    .risk-严重 {
      background: #B91C1C;
    }

    .risk-高危 {
      background: #EF4444;
    }

    .risk-中危 {
      background: #F97316;
    }
  `],
})
export class AiOverviewComponent implements OnInit, AfterViewInit {
  @ViewChild('trendCanvas') trendCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('doughnutCanvas') doughnutCanvas!: ElementRef<HTMLCanvasElement>;

  statCards: StatCard[] = [
    { label: 'AI 工具总数', value: '13', icon: 'pi pi-box', color: '#805AD5' },
    { label: '模型总数', value: '8', icon: 'pi pi-brain', color: '#3B82F6' },
    { label: '安全风险数', value: '47', icon: 'pi pi-shield', color: '#EF4444' },
    { label: '用户总数', value: '5', icon: 'pi pi-users', color: '#10B981' },
  ];

  riskUsers: RiskUser[] = [
    { name: '陈主任', riskCount: 12, level: '严重' },
    { name: '刘工程师', riskCount: 8, level: '高危' },
    { name: '王教授', riskCount: 5, level: '高危' },
  ];

  maliciousPatterns: MaliciousPattern[] = [
    { name: '数据注入', count: 156, color: '#EF4444' },
    { name: '提示注入', count: 128, color: '#F97316' },
    { name: '模型窃取', count: 89, color: '#EAB308' },
    { name: '数据泄露', count: 67, color: '#3B82F6' },
    { name: '权限越界', count: 45, color: '#10B981' },
    { name: '其他', count: 32, color: '#6B7280' },
  ];

  securityEvents: SecurityEvent[] = [
    { eventType: '泄密', time: '2026-06-22 14:32:18', result: '阻断', riskType: '严重', operator: 'chen@ruijie.com.cn', aiTool: 'ChatGPT', model: 'GPT-4' },
    { eventType: '不合规', time: '2026-06-22 13:15:42', result: '放行', riskType: '高危', operator: 'liu@ruijie.com.cn', aiTool: 'Claude', model: 'Claude 3' },
    { eventType: '敏感', time: '2026-06-22 11:08:05', result: '阻断', riskType: '中危', operator: 'wang@ruijie.com.cn', aiTool: 'Midjourney', model: 'GPT-3.5' },
    { eventType: '恶意', time: '2026-06-22 09:45:33', result: '阻断', riskType: '严重', operator: 'zhang@ruijie.com.cn', aiTool: 'DALL-E', model: 'Gemini' },
    { eventType: '泄密', time: '2026-06-22 08:22:10', result: '放行', riskType: '高危', operator: 'li@ruijie.com.cn', aiTool: 'GitHub Copilot', model: 'StarCoder' },
    { eventType: '不合规', time: '2026-06-21 16:55:27', result: '阻断', riskType: '中危', operator: 'zhao@ruijie.com.cn', aiTool: 'AI Studio', model: 'LLaMA 3' },
    { eventType: '敏感', time: '2026-06-21 14:18:09', result: '阻断', riskType: '高危', operator: 'sun@ruijie.com.cn', aiTool: 'Notion AI', model: 'Falcon' },
    { eventType: '恶意', time: '2026-06-21 10:40:51', result: '放行', riskType: '严重', operator: 'zhou@ruijie.com.cn', aiTool: '文心一言', model: 'Mistral' },
  ];

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.drawTrendChart();
    this.drawDoughnutChart();
  }

  getPercent(count: number): string {
    const total = this.maliciousPatterns.reduce((sum, p) => sum + p.count, 0);
    return ((count / total) * 100).toFixed(1);
  }

  private setupCanvas(canvas: HTMLCanvasElement, container: HTMLElement): CanvasRenderingContext2D | null {
    const dpr = window.devicePixelRatio || 1;
    const width = container.clientWidth;
    const height = container.clientHeight;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';

    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.scale(dpr, dpr);
    return ctx;
  }

  private drawTrendChart(): void {
    const canvas = this.trendCanvas?.nativeElement;
    if (!canvas) return;

    const container = canvas.parentElement;
    if (!container) return;

    const ctx = this.setupCanvas(canvas, container);
    if (!ctx) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    const data = [45, 38, 52, 41, 48, 55, 47];
    const labels = ['06-16', '06-17', '06-18', '06-19', '06-20', '06-21', '06-22'];

    const padding = { top: 10, right: 10, bottom: 24, left: 32 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    const maxVal = Math.max(...data) + 5;
    const minVal = Math.min(...data) - 5;
    const range = maxVal - minVal;

    // 网格线
    ctx.strokeStyle = 'rgba(0,0,0,0.06)';
    ctx.lineWidth = 1;
    const gridLines = 4;
    for (let i = 0; i <= gridLines; i++) {
      const y = padding.top + (chartHeight / gridLines) * i;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
      ctx.stroke();

      const val = Math.round(maxVal - range * (i / gridLines));
      ctx.fillStyle = 'var(--text-muted)';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(val.toString(), padding.left - 6, y + 3);
    }

    // 数据点
    const points: Array<{ x: number; y: number }> = [];
    for (let i = 0; i < data.length; i++) {
      const x = padding.left + (chartWidth / (data.length - 1)) * i;
      const y = padding.top + chartHeight - ((data[i] - minVal) / range) * chartHeight;
      points.push({ x, y });
    }

    // 渐变填充
    const gradient = ctx.createLinearGradient(0, padding.top, 0, height - padding.bottom);
    gradient.addColorStop(0, 'rgba(59, 130, 246, 0.25)');
    gradient.addColorStop(1, 'rgba(59, 130, 246, 0.02)');

    ctx.beginPath();
    ctx.moveTo(points[0].x, height - padding.bottom);
    for (const p of points) {
      ctx.lineTo(p.x, p.y);
    }
    ctx.lineTo(points[points.length - 1].x, height - padding.bottom);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    // 折线
    ctx.beginPath();
    ctx.strokeStyle = '#3B82F6';
    ctx.lineWidth = 2;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    for (let i = 0; i < points.length; i++) {
      if (i === 0) {
        ctx.moveTo(points[i].x, points[i].y);
      } else {
        ctx.lineTo(points[i].x, points[i].y);
      }
    }
    ctx.stroke();

    // 数据点
    for (const p of points) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
      ctx.fillStyle = '#fff';
      ctx.fill();
      ctx.strokeStyle = '#3B82F6';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // X轴标签
    ctx.fillStyle = 'var(--text-muted)';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    for (let i = 0; i < labels.length; i++) {
      const x = padding.left + (chartWidth / (data.length - 1)) * i;
      ctx.fillText(labels[i], x, height - padding.bottom + 16);
    }
  }

  private drawDoughnutChart(): void {
    const canvas = this.doughnutCanvas?.nativeElement;
    if (!canvas) return;

    const container = canvas.parentElement;
    if (!container) return;

    const ctx = this.setupCanvas(canvas, container);
    if (!ctx) return;

    const width = container.clientWidth;
    const height = container.clientHeight;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2 - 8;
    const innerRadius = radius * 0.65;

    const total = this.maliciousPatterns.reduce((sum, p) => sum + p.count, 0);
    let startAngle = -Math.PI / 2;

    for (const item of this.maliciousPatterns) {
      const sliceAngle = (item.count / total) * Math.PI * 2;
      const endAngle = startAngle + sliceAngle;

      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.arc(centerX, centerY, innerRadius, endAngle, startAngle, true);
      ctx.closePath();
      ctx.fillStyle = item.color;
      ctx.fill();

      // 间隔白边
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();

      startAngle = endAngle;
    }
  }
}
