import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { stringSimilarity } from 'string-similarity-js';
import VShuttleData from '../VShuttle-input.json';

export type Status = 'safe' | 'warning' | 'danger';

@Injectable({
  providedIn: 'root'
})
export class SimulationService {
  private scenarios: any[] = VShuttleData as any[];

  constructor() {}

  getScenarios(): any[] {
    return this.scenarios;
  }

  processItem(item: any): Observable<Status> {
    const decision = this.handleOneItem(item);
    let status: Status = 'danger';
    if (decision === 'GO') status = 'safe';
    if (decision === 'HUMAN') status = 'warning';
    if (decision === 'STOP') status = 'danger';

    return of(status).pipe(delay(500)); // Simulate latency
  }

  private isInTimeframe(timestring: string, thistime: string) {
      let e = new RegExp('[0-9].*[-]{1}.*[0-9]')
      if (e.test(timestring)) {
          let spl = e.exec(timestring)![0].split('-')
          let firstHour, lastHour
          if (spl[0].includes(':')) {
              firstHour = Number(spl[0].replaceAll(':', '.'))
          }
          else {
              firstHour = Number(spl[0])
          }
          if (spl[1].includes(':')) {
              lastHour = Number(spl[1].replaceAll(':', '.'))
          }
          else {
              lastHour = Number(spl[1])
          }
          
          let thisHour = Number(thistime.replaceAll(':', '.'))
          
          return (thisHour >= firstHour && thisHour <= lastHour)
      } else {
          return false;
      }
  }
  
  private handleOneItem(data: any): string {
      let frontale = data['sensori']['camera_frontale']
      let coeff_frontale = 1
      let laterale = data['sensori']['camera_laterale']
      let coeff_laterale = 0.85
      let rec = data['sensori']['V2I_receiver']
      let coeff_rec = 0.75
      let result = ''; 
      
      if (!(frontale['confidenza'] >= 0.6 || laterale['confidenza'] >= 0.8 || rec['confidenza'] >= 0.9)) {
          return 'HUMAN'
      }

      if (frontale['testo'] == laterale['testo'] && laterale['testo'] == rec['testo']) {
          result = frontale['testo']
      }
      else {
          let peso_frontale = frontale['confidenza']*coeff_frontale
          let peso_laterale = laterale['confidenza']*coeff_laterale
          let peso_rec = rec['confidenza']*coeff_rec
          let testi_pesi: any[] = [[frontale['testo'], peso_frontale], [laterale['testo'], peso_laterale], [rec['testo'], peso_rec]]
          let tp_finali = []
          for (let c of testi_pesi) {
              if (typeof c[1] == 'number' && c[1] >= 0.6) {tp_finali.push(c)}
          }
          if (tp_finali.length == 0) {return 'HUMAN'}
          if (tp_finali.length == 1) {result = tp_finali[0][0]}
          else {
              tp_finali.sort((a, b) => b[1] - a[1])
              if (stringSimilarity(tp_finali[0][0].replaceAll(' ', ''), tp_finali[1][0].replaceAll(' ', '')) > 0.7) {
                  result = tp_finali[0][0]
              }
          }
      }

      if (!result) {
          return 'HUMAN'
      }

      let numeric = new RegExp('[a-zA-Z][0-9]+[a-zA-Z]')
      while (numeric.test(result)) {
          result = result.replaceAll(numeric.exec(result)![0], '')
      }
  
      if (result.replaceAll(' ', '').includes('DALLE')) {
          let e = new RegExp('ALLE.*[0-9]')
          result = result.replaceAll('ALLE', '-')
          if (!(e.test(result))) {
              result = result + '-24:00'
          }
      }
  
      if (result.replaceAll(' ', '').includes('ZTL')) {
          if (result.replaceAll(' ', '').includes('NONATTIV')) {
              return 'GO'
          }
          try {
              if (this.isInTimeframe(result, data['orario_rilevamento'])) return 'STOP'
              else return 'GO'
          } catch (e) {return 'STOP'}
      }
      if (result.replaceAll(' ', '').includes('ECCETTO') && result.replaceAll(' ', '').includes('BUS')) {
          return 'GO'
      }
      if (result.replaceAll(' ', '').includes('DIVIETO')) {
          try {
              if (this.isInTimeframe(result, data['orario_rilevamento'])) {
                  return 'STOP'
              }
              else {
                  return 'GO'
              }
          } catch (e) {return 'STOP'}
      }
      return 'GO';
  }
}
