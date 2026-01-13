import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { polymarketLimiter, withRateLimit } from './rate-limiter.util';
import { HTTP_CONFIG } from '../core/constants';

// Create axios instance with optimized connection pooling
const http = require('http');
const https = require('https');

const axiosInstance: AxiosInstance = axios.create({
  timeout: HTTP_CONFIG.TIMEOUT,
  httpAgent: new http.Agent({ 
    keepAlive: true, 
    keepAliveMsecs: HTTP_CONFIG.KEEP_ALIVE_MSECS,
    maxSockets: HTTP_CONFIG.MAX_SOCKETS,
    maxFreeSockets: HTTP_CONFIG.MAX_FREE_SOCKETS,
  }),
  httpsAgent: new https.Agent({ 
    keepAlive: true, 
    keepAliveMsecs: HTTP_CONFIG.KEEP_ALIVE_MSECS,
    maxSockets: HTTP_CONFIG.MAX_SOCKETS,
    maxFreeSockets: HTTP_CONFIG.MAX_FREE_SOCKETS,
  }),
});

export async function httpGet<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T> {
  return withRateLimit(polymarketLimiter, async () => {
    const res = await axiosInstance.get<T>(url, config);
    return res.data;
  });
}


export async function httpPost<T = unknown>(
  url: string,
  body?: unknown,
  config?: AxiosRequestConfig,
): Promise<T> {
  return withRateLimit(polymarketLimiter, async () => {
    const res = await axiosInstance.post<T>(url, body, config);
    return res.data;
  });
}

