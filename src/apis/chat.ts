/**
 * @file src/apis/chat.ts
 * @description 聊天相关 API 接口模块
 * 包含对话创建、获取对话详情等接口
 * @author React AI Studio
 */

// 项目内部模块 - HTTP 请求封装
import { request } from '../utils'

/**
 * 创建新对话 API
 * 为用户创建一个新的聊天对话会话
 * @param userId - 用户 ID
 * @returns Promise 包含新创建的对话 ID
 */
export function createNewConversationAPI(userId: number) {
    return request({
        url: 'chat/conversation',
        method: 'POST',
        data: { userId }
    })
}

/**
 * 获取对话详情 API
 * 获取指定对话的详细信息
 * @param useId - 用户 ID
 * @param id - 对话 ID
 * @returns Promise 包含对话详情
 */
export function getConversationDetailAPI(useId: number, id: number) {
    return request({
        url: `chat/conversation?userId=${useId}&id=${id}`,
        method: 'GET',
    })
}
