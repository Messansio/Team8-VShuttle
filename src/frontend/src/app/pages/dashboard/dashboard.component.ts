import { Component, signal, CUSTOM_ELEMENTS_SCHEMA, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SimulationService, Status } from '../../services/simulation.service';
import { Subscription, interval, timer } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit, OnDestroy {
  status = signal<Status>('safe');
  private scenarios: any[] = [];
  private currentIndex = 0;
  private simulationSub?: Subscription;
  private humanTimerSub?: Subscription;

  constructor(private simulationService: SimulationService) {
    this.scenarios = this.simulationService.getScenarios();
  }

  ngOnInit() {
    this.startSimulationLoop();
  }

  setStatus(newStatus: Status) {
    this.status.set(newStatus);
  }

  start() {
    // This is the 'CONTINUE' button action
    if (this.status() === 'warning') {
        // Human intervention confirmed continue
        this.humanTimerSub?.unsubscribe();
        this.setStatus('safe');
        return;
    }
    
    // If stopped or not running, restart?
    if (!this.simulationSub || this.simulationSub.closed) {
        this.startSimulationLoop();
    }
  }

  private startSimulationLoop() {
    this.simulationSub?.unsubscribe();
    // Start immediately (0 delay) then every 4s
    this.simulationSub = timer(0, 4000).subscribe(() => {
      this.processNextItem();
    });
  }

  // Need to act on the *current* item or next?
  // 'Esegui ... sull'elemento corrente'.
  // We increment index after processing.
  
  private processNextItem() {
    if (this.currentIndex >= this.scenarios.length) {
      this.simulationSub?.unsubscribe(); // End gracefully
      return;
    }

    const item = this.scenarios[this.currentIndex];

    // If we are in danger (from previous timeout or manual stop), do not process.
    // The interval should have been unsubscribed, but for safety:
    if (this.status() === 'danger') {
        return; 
    }

    this.simulationService.processItem(item).subscribe(resultStatus => {
      this.handleStatusResult(resultStatus);
    });

    // Advance index for next tick
    this.currentIndex++;
  }

  private handleStatusResult(result: Status) {
      if (result === 'safe') {
          this.setStatus('safe');
      } else if (result === 'warning') {
          this.setStatus('warning');
          // Start 2s timer for Human interaction; if Continue is pressed it will be cleared.
          this.humanTimerSub?.unsubscribe();
          this.humanTimerSub = timer(2000).subscribe(() => {
             this.stop(true); // Timeout -> Forced STOP
          });
      } else if (result === 'danger') {
          this.stop(true); // Immediate STOP from backend
      }
  }

  stop(force: boolean = true) {
    if (force) {
        this.setStatus('danger');
    }
    this.simulationSub?.unsubscribe();
    this.humanTimerSub?.unsubscribe();
  }

  reset() {
    this.setStatus('safe');
    // Resume from current index (which was incremented but loop stopped, so effectively next item)
    // 'Riprende dall'elemento successivo'.
    this.startSimulationLoop();
  }

  ngOnDestroy() {
    this.simulationSub?.unsubscribe();
    this.humanTimerSub?.unsubscribe();
  }
}
