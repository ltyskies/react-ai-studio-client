/**
 * @file src/apis/user.ts
 * @description 用户相关 API 接口模块
 * 包含用户登录等接口
 * @author React AI Studio
 */

// 项目内部模块 - HTTP 请求封装
import { request } from '../utils'

/**
 * 登录表单数据接口
 * @property email - 用户邮箱地址
 * @property password - 用户登录密码
 */
interface LoginFormData {
    email: string;
    password: string;
}

/**
 * 用户登录 API
 * 发送登录请求，验证用户身份
 * @param formData - 登录表单数据，包含邮箱和密码
 * @returns Promise 包含登录响应结果
 */
export function loginAPI(formData: LoginFormData) {
    return request({
        url: 'user/login',
        method: 'POST',
        data: formData
    })
}
