import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { HeaderComponent } from './components/header/header.component';
import { FloatingBtnComponent } from './components/floating-btn/floating-btn.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, HeaderComponent, FloatingBtnComponent],
  template: `
    <div class="app-layout">
      <app-sidebar />
      <div class="main-area">
        <app-header />
        <div class="main-content">
          <router-outlet />
        </div>
      </div>
    </div>
    <app-floating-btn />
  `,
  styles: [`
    .app-layout {
      display: flex;
      min-height: 100vh;
      background: var(--bg-page);
    }

    .main-area {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-width: 0;
    }

    .main-content {
      flex: 1;
      overflow-y: auto;
    }
  `],
})
export class AppComponent {}