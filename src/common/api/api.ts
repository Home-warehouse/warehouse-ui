import { Injectable } from '@angular/core';
import { NotificationsSharedService } from "src/app/notifications/notifications.sharedService"
import { RequestConfig } from "../interfaces/request.interface"
import { SendHTTPrequest } from "./wrapper"


@Injectable({
  providedIn: 'root'
})
export class hwAPI {
  constructor(
    private notifications: NotificationsSharedService
  ){}

  fetch = async(dataObject: Object, ) => {

    let headers: any = {"content-type": "application/json"}

    const accessToken = localStorage.getItem("accessToken")
    if(accessToken){
      headers["Authorization"] = accessToken
    }

    const requestConfig: RequestConfig = {
      endpoint: 'graphql',
      method: 'POST',
      headers: headers,
      data: JSON.stringify(dataObject),
      }

    const response = await SendHTTPrequest(requestConfig)
    if(response.status == 503){
      this.notifications.sendOpenNotificationEvent({
        message: `Could not connect with remote server, try later`,
        type: 'ERROR'
      })
    }
    return response
  }
}

const apiFetch = async(dataObject: Object, ) => {

  let headers: any = {"content-type": "application/json"}

  const accessToken = localStorage.getItem("accessToken")
  if(accessToken){
    headers["Authorization"] = accessToken
  }

  const requestConfig: RequestConfig = {
    endpoint: 'graphql',
    method: 'POST',
    headers: headers,
    data: JSON.stringify(dataObject),
    }

  const response = await SendHTTPrequest(requestConfig)
  return response
}

export { apiFetch };
