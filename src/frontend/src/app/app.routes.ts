import { Routes } from '@angular/router';
import { StartScreenComponent } from './pages/start-screen/start-screen.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';

export const routes: Routes = [
  { path: '', component: StartScreenComponent },
  { path: 'dashboard', component: DashboardComponent },
];
