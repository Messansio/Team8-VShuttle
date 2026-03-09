import { Component, signal, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';

type Status = 'safe' | 'warning' | 'danger';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  status = signal<Status>('safe');

  setStatus(newStatus: Status) {
    this.status.set(newStatus);
  }

  start() {
    this.setStatus('safe');
  }

  stop() {
    this.setStatus('danger');
  }

  reset() {
    this.setStatus('safe');
  }
}
