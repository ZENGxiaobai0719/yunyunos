import axios from 'axios'
import type { ApiResponse } from '@/types'

const client = axios.create({
  baseURL: '/api',
  timeout: 10000,
})

// 响应拦截器：自动解包 { code, message, data } → 直接返回 data
client.interceptors.response.use(
  (response): any => {
    const body: ApiResponse<unknown> = response.data
    if (body.code === 0) {
      return body.data
    }
    return Promise.reject(new Error(body.message || '请求失败'))
  },
  (error) => {
    const msg = error.response?.data?.message || error.message || '网络错误'
    return Promise.reject(new Error(msg))
  }
)

export default client
