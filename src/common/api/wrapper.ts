import { environment } from 'src/environments/environment';
import { RequestConfig, DataObject } from '../interfaces/request.interface';

const API_ENDPOINT = environment.apiIP;

export type result = {
  status: number,
  statusText: object | string,
  headers?: object | any,
  data?: object | any
};

const binaryContentTypesToBeSaved = [
  'image/png', 'image/jpeg', 'image/jpg', 'application/x-tar'
];


const parseData = async (response: any, headers: Headers, debug = false) => {
  if (debug) {
    console.warn('Trying to parse data');
  }
  const responseBlob = response.clone();
  const contentType = await headers.get('Content-Type');
  if (contentType){
    if (contentType.includes('json')) {
      const rawData = await response.json();
      return (rawData);
    } if (binaryContentTypesToBeSaved.find((currType) => contentType.includes(currType))) {
        const blob = await responseBlob.blob();
        const data = URL.createObjectURL(blob);
        return data;
    }
  }
  return response.text();
};

const fetchMethod = async (url: string, initialFetchConfig: DataObject, timeout = 5000, debug = false) => {
  const controller = new AbortController();
  const signal = controller.signal;
  const fetchConfig = { ...initialFetchConfig, signal };

  const abortTimeout = setTimeout(() => {
    controller.abort();
  }, timeout);

  debug && console.warn(fetchConfig);

  let response;
  try {
    response = await fetch(url, fetchConfig);
    if (!response.ok && debug) {
      throw new Error(`${response.status}: ${response.statusText}`);
    }
    const responseObject = {
      status: response.status,
      statusText: response.statusText,
      // headers: JSON.stringify(response.headers),
      data: await parseData(response, response.headers, debug),
    };

    clearTimeout(abortTimeout);
    debug && console.warn(responseObject);
    return responseObject;
  } catch (error) {
    return {status: 503, statusText: 'Service Unavailable'};
  }
};

/**
     * Send an HTTP Request
     * @param {Object} requestConfig - Request configuration which will be send.
     * @param {string} requestConfig.endpoint to make http request.
     * @param {string} requestConfig.method Http request method.
     * @param {object} requestConfig.headers Http request headers.
     * @param {object} requestConfig.data Http request data.
     * @param {number} requestConfig.timeout Http request timeout in miliseconds.
     * @param {string} requestConfig.dataDirectory If request will return binary file set where
     * file should be saved.
     * @param {number} requestConfig.debug Turns on debug mode - set to 'True'.
     * @returns {Object} An {status, statusText, headers, data}
     * containing status and data from response.
  */
const SendHTTPrequest = async (requestConfig: RequestConfig): Promise<result> => {
  // Headers settings
  const url = API_ENDPOINT + requestConfig.endpoint;


  const fetchConfig: any = {};
  fetchConfig.headers = requestConfig.headers;
  fetchConfig.method = requestConfig.method;

  if(requestConfig.headers['Content-Type'] === 'application/json'){
    const stringifiedJSON = JSON.stringify(requestConfig.data)
    fetchConfig.body = stringifiedJSON;
  } else {
    fetchConfig.body = requestConfig.data;
  }

  try {
    const responseObject: result = await fetchMethod(url, fetchConfig, requestConfig.timeout);
    return responseObject;
  } catch (error) {
    console.warn(error)
    return {
      status: 500,
      statusText: "notconnected"
    }
  }
};

export  { SendHTTPrequest, RequestConfig };
