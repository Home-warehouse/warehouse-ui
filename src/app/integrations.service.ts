import { Injectable } from '@angular/core';
import { hwAPI } from 'src/common/api/api';
import { NotificationsSharedService } from './notifications/notifications.sharedService';

const evernoteDict = {
  NOTE: 'NOTE',
  TODO: 'TODO'
};

export type EvernoteType = keyof typeof evernoteDict;

@Injectable({
  providedIn: 'root'
})
export class IntegrationsService {

  constructor(
    private hwAPI: hwAPI,
    private notifications: NotificationsSharedService,
  ) { }

  queryEvernoteRaport = async(noteType: EvernoteType, noteTitle: string, raportVariables: any) => {
    const result = await this.hwAPI.fetch({
      query: `query createEvernoteNote($config: String!, $showCustomColumns: [String]!, $sortBy: SortRaportInput!, $filterBy: [FilterRaportInput]!, $limit: Int) {
        evernoteRaportResolver(
          config: $config
          showCustomColumns: $showCustomColumns
          sortBy: $sortBy
          filterBy: $filterBy
          limit: $limit
        ){
          createdNote
        }
      }`,
      variables: {...raportVariables, config: JSON.stringify({noteType, noteTitle})}
    })
    if(result.data?.data?.evernoteRaportResolver?.createdNote){
      this.notifications.sendOpenNotificationEvent({
        message: `Created evernote note successfully!`,
         type: 'SUCCESS'
      });
    } else {
      this.notifications.sendOpenNotificationEvent({
        message: `Could not create evernote note, try again or ask administrator for further help`,
        type: 'ERROR'
      });
    }
  }
}
