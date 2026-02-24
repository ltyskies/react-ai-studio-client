/**
 * @file src/store/chatStore.tsx
 * @description 聊天状态管理模块
 * 使用 Zustand + Immer 管理聊天对话状态，包括消息列表、对话ID、输入状态等
 * @author React AI Studio
 */

// 状态管理库 - Zustand
import { create } from 'zustand';

// 不可变数据更新库
import { produce } from 'immer';

/**
 * 消息对象接口
 * @property role - 消息发送者角色：'user'(用户) 或 'assistant'(AI助手)
 * @property content - 消息内容文本
 */
export interface Message {
    role: 'user' | 'assistant';
    content: string;
}

/**
 * 聊天状态接口
 * @property conversationId - 当前对话的唯一标识
 * @property messages - 消息列表数组
 * @property isTyping - AI是否正在输入（流式响应中）
 * @property setConversationId - 设置对话ID的方法
 * @property addMessage - 添加新消息的方法
 * @property updateLastMessage - 更新最后一条消息内容的方法（用于流式输出）
 * @property setIsTyping - 设置输入状态的方法
 * @property clearHistory - 清空消息历史的方法
 */
interface ChatState {
    conversationId: number | string;
    messages: Message[];
    isTyping: boolean;
    setConversationId: (id: number | string) => void;
    addMessage: (msg: Message) => void;
    updateLastMessage: (content: string) => void;
    setIsTyping: (status: boolean) => void;
    clearHistory: () => void;
}

/**
 * 创建聊天状态 Store
 * 使用 Immer 的 produce 函数实现不可变更新
 */
export const useChatStore = create<ChatState>()(
    (set) => ({
        // 默认对话ID
        conversationId: 4,
        // 消息列表，初始为空数组
        messages: [],
        // AI输入状态，初始为 false
        isTyping: false,

        /**
         * 设置对话ID
         * @param id - 新的对话ID
         */
        setConversationId: (id) => set({ conversationId: id }),

        /**
         * 设置AI输入状态
         * @param status - true 表示正在输入，false 表示输入完成
         */
        setIsTyping: (status) => set({ isTyping: status }),

        /**
         * 添加新消息到列表
         * @param msg - 要添加的消息对象
         */
        addMessage: (msg) =>
            set(produce((state: ChatState) => {
                // 使用 Immer 直接 push，produce 会处理不可变性
                state.messages.push(msg);
            })),

        /**
         * 更新最后一条消息的内容
         * 用于流式响应时逐步更新AI回复内容
         * @param content - 新的消息内容
         */
        updateLastMessage: (content) =>
            set(produce((state: ChatState) => {
                const lastMsg = state.messages[state.messages.length - 1];
                // 只有最后一条消息是 AI 回复时才更新
                if (lastMsg && lastMsg.role === 'assistant') {
                    lastMsg.content = content;
                }
            })),

        /**
         * 清空消息历史
         * 保留对话ID，只清空消息列表
         */
        clearHistory: () => set({ messages: [] }),
    }
    )
);
