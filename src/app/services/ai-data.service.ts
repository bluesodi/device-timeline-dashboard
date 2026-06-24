import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

// ==================== 数据接口 ====================

export interface AppNode {
  id: string;
  name: string;
  icon: string;
  type: string;
  category: string;
  connections: number;
  tokenUsage: number;
  status: 'active' | 'inactive';
  lastActive: string;
  allowed: boolean;
}

// ==================== 初始数据（仅 AI 应用层） ====================

const INITIAL_APPS: AppNode[] = [
  { id: 'a-chatgpt', name: 'ChatGPT', icon: '\u{1F916}', type: 'AI助手', category: '大语言模型', connections: 2, tokenUsage: 52000, status: 'active', lastActive: '刚刚', allowed: true },
  { id: 'a-chrome', name: 'Chrome', icon: '\u{1F310}', type: '浏览器', category: '浏览器', connections: 3, tokenUsage: 18700, status: 'active', lastActive: '1分钟前', allowed: true },
  { id: 'a-claude', name: 'Claude', icon: '\u{1F916}', type: 'AI助手', category: '大语言模型', connections: 1, tokenUsage: 24500, status: 'active', lastActive: '刚刚', allowed: true },
  { id: 'a-midjourney', name: 'Midjourney', icon: '\u{1F3A8}', type: 'AI工具', category: '图像生成', connections: 2, tokenUsage: 8300, status: 'active', lastActive: '5分钟前', allowed: true },
  { id: 'a-edge', name: 'Edge', icon: '\u{1F310}', type: '浏览器', category: '浏览器', connections: 2, tokenUsage: 12400, status: 'active', lastActive: '3分钟前', allowed: true },
  { id: 'a-copilot', name: 'GitHub Copilot', icon: '\u{1F4BB}', type: 'AI工具', category: '代码助手', connections: 2, tokenUsage: 35200, status: 'active', lastActive: '刚刚', allowed: true },
  { id: 'a-dalle', name: 'DALL-E', icon: '\u{1F3A8}', type: 'AI工具', category: '图像生成', connections: 1, tokenUsage: 5200, status: 'active', lastActive: '12分钟前', allowed: true },
  { id: 'a-aistudio', name: 'AI Studio', icon: '\u{1F9E0}', type: 'AI工具', category: 'AI平台', connections: 4, tokenUsage: 41000, status: 'active', lastActive: '刚刚', allowed: true },
  { id: 'a-notion', name: 'Notion AI', icon: '\u{1F4DD}', type: 'AI工具', category: '笔记', connections: 2, tokenUsage: 9800, status: 'active', lastActive: '4分钟前', allowed: true },
  { id: 'a-wenxin', name: '\u6587\u5FC3\u4E00\u8A00', icon: '\u{1F916}', type: 'AI助手', category: '大语言模型', connections: 2, tokenUsage: 15600, status: 'active', lastActive: '2分钟前', allowed: true },
  { id: 'a-ernie', name: 'ERNIE 4.0', icon: '\u{1F916}', type: 'AI助手', category: '大语言模型', connections: 2, tokenUsage: 18900, status: 'active', lastActive: '1分钟前', allowed: true },
  { id: 'a-qwen', name: 'Qwen', icon: '\u{1F916}', type: 'AI助手', category: '大语言模型', connections: 2, tokenUsage: 11200, status: 'active', lastActive: '6分钟前', allowed: true },
  { id: 'a-xverse', name: 'Xverse', icon: '\u{1F916}', type: 'AI助手', category: '大语言模型', connections: 2, tokenUsage: 9400, status: 'inactive', lastActive: '45分钟前', allowed: false },
];

@Injectable({ providedIn: 'root' })
export class AiDataService {
  private appsSubject = new BehaviorSubject<AppNode[]>(this.deepClone(INITIAL_APPS));
  readonly apps$ = this.appsSubject.asObservable();

  get apps(): AppNode[] {
    return this.appsSubject.value;
  }

  /** 切换允许/禁止状态 */
  toggleAllowed(id: string): void {
    const apps = this.deepClone(this.appsSubject.value);
    const app = apps.find(a => a.id === id);
    if (app) {
      app.allowed = !app.allowed;
      app.status = app.allowed ? 'active' : 'inactive';
      this.appsSubject.next(apps);
    }
  }

  /** 批量切换允许/禁止 */
  batchToggleAllowed(ids: string[], allowed: boolean): void {
    const apps = this.deepClone(this.appsSubject.value);
    for (const id of ids) {
      const app = apps.find(a => a.id === id);
      if (app) {
        app.allowed = allowed;
        app.status = allowed ? 'active' : 'inactive';
      }
    }
    this.appsSubject.next(apps);
  }

  /** 删除应用 */
  deleteApp(id: string): void {
    const apps = this.deepClone(this.appsSubject.value).filter(a => a.id !== id);
    this.appsSubject.next(apps);
  }

  /** 批量删除 */
  batchDelete(ids: string[]): void {
    const idSet = new Set(ids);
    const apps = this.deepClone(this.appsSubject.value).filter(a => !idSet.has(a.id));
    this.appsSubject.next(apps);
  }

  /** 新增应用 */
  addApp(app: Omit<AppNode, 'id'>): AppNode {
    const newApp: AppNode = {
      ...app,
      id: 'a-' + Date.now(),
    };
    const apps = [...this.deepClone(this.appsSubject.value), newApp];
    this.appsSubject.next(apps);
    return newApp;
  }

  /** 编辑应用 */
  updateApp(id: string, data: Partial<AppNode>): void {
    const apps = this.deepClone(this.appsSubject.value);
    const app = apps.find(a => a.id === id);
    if (app) {
      Object.assign(app, data);
      this.appsSubject.next(apps);
    }
  }

  private deepClone<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
  }
}