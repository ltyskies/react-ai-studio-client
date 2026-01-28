import axios from 'axios'
import { getToken,removeToken } from './token'
import  router  from '@/router'

const apiBaseUrl = (import.meta as any)?.env?.VITE_API_BASE || 'http://127.0.0.1:3000'

const request = axios.create({
    baseURL: apiBaseUrl,
    timeout: 5000
})


request.interceptors.request.use((config)=>{
    const token = getToken()
    console.log('请求拦截器',token)
    if(token){
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
},(error) =>{
    return Promise.reject(error)
})

request.interceptors.response.use((response) => {
  // 2xx 范围内的状态码都会触发该函数。
  // 对响应数据做点什么
  return response.data
}, (error) => {
  // 超出 2xx 范围的状态码都会触发该函数。
  // 对响应错误做点什么
  // 监控401 token失效
  console.dir(error)
  if (error?.response?.status === 401) {
    removeToken()
    router.navigate('/login')
    window.location.reload()
  }
  return Promise.reject(error)
})

export { request }