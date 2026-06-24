import { Component } from '@angular/core';

@Component({
  selector: 'app-floating-btn',
  standalone: true,
  template: `
    <button class="floating-btn" title="帮助">
      <div class="fb-avatar">?</div>
    </button>
  `,
  styles: [`
    .floating-btn {
      position: fixed;
      bottom: 32px;
      right: 32px;
      width: 48px;
      height: 48px;
      border-radius: 50%;
      border: none;
      background: var(--brand-primary);
      box-shadow: 0 4px 12px rgba(124, 58, 237, 0.35);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.2s, box-shadow 0.2s;
      z-index: 1000;
    }

    .floating-btn:hover {
      transform: scale(1.08);
      box-shadow: 0 6px 16px rgba(124, 58, 237, 0.45);
    }

    .fb-avatar {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.3);
      color: white;
      font-size: 14px;
      font-weight: 600;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  `]
})
export class FloatingBtnComponent {}