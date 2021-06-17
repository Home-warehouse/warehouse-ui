import { RequestConfig } from "../interfaces/request.interface"
import { SendHTTPrequest } from "./wrapper"

const apiFetch = async(dataObject: Object, ) => {
  // Try to get
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

  return SendHTTPrequest(requestConfig)
}

export { apiFetch };
