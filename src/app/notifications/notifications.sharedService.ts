import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { NotificationParameters } from './notifications.interface';

@Injectable({
  providedIn: 'root'
})

export class NotificationsSharedService {
  private subject = new Subject<any>();

  sendOpenNotificationEvent(params: NotificationParameters) {
    this.subject.next(params);
  }

  getOpenNotificationEvent(): Observable<any> {
    return this.subject.asObservable();
  }
}
