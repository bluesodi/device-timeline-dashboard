import { Routes } from '@angular/router';
import { DeviceDetailComponent } from './pages/device-detail/device-detail.component';
import { AiOverviewComponent } from './pages/ai-security/ai-overview.component';
import { AiDiscoveryComponent } from './pages/ai-security/ai-discovery.component';
import { AiVisualizationComponent } from './pages/ai-security/ai-visualization.component';
import { AiControlComponent } from './pages/ai-security/ai-control.component';
import { AiPolicyComponent } from './pages/ai-security/ai-policy.component';

export const routes: Routes = [
  { path: '', redirectTo: 'device-detail', pathMatch: 'full' },
  { path: 'device-detail', component: DeviceDetailComponent },
  { path: 'ai-security/overview', component: AiOverviewComponent },
  { path: 'ai-security/discovery', component: AiDiscoveryComponent },
  { path: 'ai-security/visualization', component: AiVisualizationComponent },
  { path: 'ai-security/control', component: AiControlComponent },
  { path: 'ai-security/policy', component: AiPolicyComponent },
  { path: '**', redirectTo: 'device-detail' },
];
