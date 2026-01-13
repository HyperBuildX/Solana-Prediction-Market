import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { polymarketLimiter, withRateLimit } from './rate-limiter.util';

// Create axios instance with optimized connection pooling
const http = require('http');
const https = require('https');

const axiosInstance: AxiosInstance = axios.create({
  timeout: 10000,
  httpAgent: new http.Agent({ 
    keepAlive: true, 
    keepAliveMsecs: 30000,
    maxSockets: 50, // Increased for better concurrency
    maxFreeSockets: 10,
  }),
  httpsAgent: new https.Agent({ 
    keepAlive: true, 
    keepAliveMsecs: 30000,
    maxSockets: 50, // Increased for better concurrency
    maxFreeSockets: 10,
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

