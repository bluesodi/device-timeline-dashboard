import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-ai-policy',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-container">
      <h1 class="page-title">策略配置</h1>
      <div class="two-column-layout">
        <!-- Left: Form -->
        <div class="form-card">
          <div class="card-title">基础配置</div>

          <div class="form-group">
            <label class="form-label">策略名称</label>
            <input
              type="text"
              class="form-input"
              placeholder="请输入策略名称"
              [value]="config.name"
              (input)="config.name = $any($event.target).value; updatePreview()"
            />
          </div>

          <div class="form-group">
            <label class="form-label">策略描述</label>
            <textarea
              class="form-textarea"
              rows="3"
              placeholder="请输入策略描述"
              [value]="config.description"
              (input)="config.description = $any($event.target).value; updatePreview()"
            ></textarea>
          </div>

          <div class="form-group">
            <label class="form-label">AI 模型范围</label>
            <select
              class="form-select"
              [value]="config.modelScope"
              (change)="config.modelScope = $any($event.target).value; updatePreview()"
            >
              <option value="all">全部模型</option>
              <option value="specified">指定模型</option>
              <option value="custom">自定义范围</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">风险阈值</label>
            <div class="range-wrapper">
              <input
                type="range"
                class="form-range"
                min="0"
                max="100"
                [value]="config.riskThreshold"
                (input)="config.riskThreshold = +$any($event.target).value; updatePreview()"
              />
              <span class="range-value">{{ config.riskThreshold }}</span>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">自动响应</label>
            <label class="switch">
              <input
                type="checkbox"
                [checked]="config.autoResponse"
                (change)="config.autoResponse = $any($event.target).checked; updatePreview()"
              />
              <span class="switch-slider"></span>
            </label>
          </div>

          <div class="form-group">
            <label class="form-label">通知方式</label>
            <div class="checkbox-group">
              <label class="checkbox-item">
                <input
                  type="checkbox"
                  [checked]="config.notifyEmail"
                  (change)="config.notifyEmail = $any($event.target).checked; updatePreview()"
                />
                <span class="checkbox-label">邮件</span>
              </label>
              <label class="checkbox-item">
                <input
                  type="checkbox"
                  [checked]="config.notifySms"
                  (change)="config.notifySms = $any($event.target).checked; updatePreview()"
                />
                <span class="checkbox-label">短信</span>
              </label>
              <label class="checkbox-item">
                <input
                  type="checkbox"
                  [checked]="config.notifyInApp"
                  (change)="config.notifyInApp = $any($event.target).checked; updatePreview()"
                />
                <span class="checkbox-label">站内信</span>
              </label>
            </div>
          </div>

          <button class="btn-save">保存配置</button>
        </div>

        <!-- Right: Preview -->
        <div class="preview-card">
          <div class="card-title">配置预览</div>
          <pre class="code-block"><code>{{ previewJson }}</code></pre>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-container {
      padding: 24px;
      background: var(--bg-page);
      min-height: 100%;
    }

    .page-title {
      font-size: 18px;
      font-weight: 600;
      color: var(--text-primary);
      margin: 0 0 20px 0;
    }

    .two-column-layout {
      display: flex;
      gap: 24px;
      align-items: flex-start;
    }

    .form-card,
    .preview-card {
      width: 50%;
      background: var(--bg-white);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-md);
      padding: 24px;
      box-sizing: border-box;
    }

    .preview-card {
      position: sticky;
      top: 24px;
    }

    .card-title {
      font-size: 15px;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 20px;
      padding-bottom: 12px;
      border-bottom: 1px solid var(--border-light, #eee);
    }

    .form-group {
      margin-bottom: 18px;
    }

    .form-label {
      display: block;
      font-size: 13px;
      color: var(--text-muted);
      margin-bottom: 6px;
      font-weight: 500;
    }

    .form-input,
    .form-select,
    .form-textarea {
      width: 100%;
      padding: 8px 12px;
      border: 1px solid var(--border-light, #e0e0e0);
      border-radius: var(--radius-sm, 6px);
      background: var(--bg-white);
      color: var(--text-primary);
      font-size: 13px;
      outline: none;
      box-sizing: border-box;
      transition: border-color 0.15s;
    }

    .form-input:focus,
    .form-select:focus,
    .form-textarea:focus {
      border-color: #7c3aed;
    }

    .form-textarea {
      resize: vertical;
      font-family: inherit;
    }

    /* Range Slider */
    .range-wrapper {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .form-range {
      flex: 1;
      height: 6px;
      -webkit-appearance: none;
      appearance: none;
      background: #e0e0e0;
      border-radius: 3px;
      outline: none;
    }

    .form-range::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 18px;
      height: 18px;
      border-radius: 50%;
      background: #7c3aed;
      cursor: pointer;
      border: 2px solid #fff;
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
    }

    .range-value {
      min-width: 36px;
      text-align: center;
      font-size: 14px;
      font-weight: 600;
      color: #7c3aed;
    }

    /* Toggle Switch */
    .switch {
      position: relative;
      display: inline-block;
      width: 40px;
      height: 22px;
      cursor: pointer;
    }

    .switch input {
      opacity: 0;
      width: 0;
      height: 0;
    }

    .switch-slider {
      position: absolute;
      inset: 0;
      background: #ccc;
      border-radius: 22px;
      transition: background 0.2s;
    }

    .switch-slider::before {
      content: '';
      position: absolute;
      width: 16px;
      height: 16px;
      left: 3px;
      bottom: 3px;
      background: #fff;
      border-radius: 50%;
      transition: transform 0.2s;
    }

    .switch input:checked + .switch-slider {
      background: #7c3aed;
    }

    .switch input:checked + .switch-slider::before {
      transform: translateX(18px);
    }

    /* Checkbox Group */
    .checkbox-group {
      display: flex;
      gap: 20px;
    }

    .checkbox-item {
      display: flex;
      align-items: center;
      gap: 6px;
      cursor: pointer;
      font-size: 13px;
      color: var(--text-primary);
    }

    .checkbox-item input[type="checkbox"] {
      width: 16px;
      height: 16px;
      accent-color: #7c3aed;
      cursor: pointer;
    }

    .checkbox-label {
      user-select: none;
    }

    /* Save Button */
    .btn-save {
      width: 100%;
      padding: 10px;
      background: #7c3aed;
      color: #fff;
      border: none;
      border-radius: var(--radius-md, 8px);
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      margin-top: 8px;
      transition: opacity 0.15s;
    }

    .btn-save:hover {
      opacity: 0.85;
    }

    /* Code Block */
    .code-block {
      background: #1e1e2e;
      color: #cdd6f4;
      border-radius: var(--radius-md, 8px);
      padding: 16px;
      font-family: 'Fira Code', 'Consolas', 'Monaco', monospace;
      font-size: 12px;
      line-height: 1.6;
      overflow-x: auto;
      margin: 0;
      white-space: pre-wrap;
      word-break: break-all;
    }

    .code-block code {
      color: inherit;
      font-family: inherit;
    }
  `],
})
export class AiPolicyComponent {
  config = {
    name: '',
    description: '',
    modelScope: 'all',
    riskThreshold: 50,
    autoResponse: false,
    notifyEmail: true,
    notifySms: false,
    notifyInApp: true,
  };

  previewJson = '';

  ngOnInit(): void {
    this.updatePreview();
  }

  updatePreview(): void {
    const scopeMap: Record<string, string> = {
      all: '全部模型',
      specified: '指定模型',
      custom: '自定义范围',
    };

    const notification: string[] = [];
    if (this.config.notifyEmail) notification.push('邮件');
    if (this.config.notifySms) notification.push('短信');
    if (this.config.notifyInApp) notification.push('站内信');

    const preview = {
      name: this.config.name || '(未填写)',
      description: this.config.description || '(未填写)',
      modelScope: scopeMap[this.config.modelScope] || this.config.modelScope,
      riskThreshold: this.config.riskThreshold,
      autoResponse: this.config.autoResponse,
      notification: notification.length > 0 ? notification : ['(未配置)'],
    };

    this.previewJson = JSON.stringify(preview, null, 2);
  }
}
