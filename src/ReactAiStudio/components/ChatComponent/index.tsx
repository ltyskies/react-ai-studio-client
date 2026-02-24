/**
 * @file src/ReactAiStudio/components/ChatComponent/index.tsx
 * @description AI 聊天组件
 * 提供与 AI 助手的对话功能，支持文件上下文、流式响应、代码纠错
 * @author React AI Studio
 */

// React 核心库 - Hooks
import { useState, useRef, useEffect, useContext, useCallback } from 'react';

// 第三方库 - 虚拟列表
import { VList, type VListHandle } from 'virtua';

// 第三方库 - 图标
import { Send, Square, User, Bot, FileCode, X, Plus } from 'lucide-react';

// 项目内部模块 - 聊天状态管理
import { useChatStore } from '../../../store/chatStore';

// 项目内部 Context - AI Studio 全局状态
import { AIStudioContext } from '../../AIStudioContext';

// 样式文件
import styles from './index.module.scss';

// 项目内部模块 - Token 管理
import { getToken } from '../../../utils/token';

// 项目内部模块 - API 基础 URL
import { apiBaseUrl } from '../../../utils/request';

// React 核心库
import React from 'react';

// 懒加载 Markdown 渲染组件
const MarkdownRenderer = React.lazy(() => import('./MarkdownRenderer'));

/**
 * AI 聊天组件
 * 提供完整的聊天界面，包括消息列表、输入框、文件上下文选择等功能
 */
const AIChat = () => {
    // 从聊天状态管理获取相关状态和方法
    const { messages, conversationId, isTyping, addMessage, updateLastMessage, setIsTyping } = useChatStore();

    // 从 Context 获取文件列表和当前选中文件
    const { files, selectedFileName } = useContext(AIStudioContext);

    // 输入框内容
    const [input, setInput] = useState('');
    // 上下文文件列表（选中的文件作为 AI 上下文）
    const [contextFiles, setContextFiles] = useState<string[]>([]);
    // 是否显示文件选择器
    const [showFilePicker, setShowFilePicker] = useState(false);

    // --- 滚动控制逻辑 ---
    // 是否自动滚动到底部
    const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
    // 虚拟列表引用
    const scrollRef = useRef<VListHandle>(null);

    // 用户 Token
    const token = getToken();
    // 输入框引用
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    // 文件选择器引用（用于点击外部关闭）
    const pickerRef = useRef<HTMLDivElement>(null);
    // 请求取消控制器
    const abortControllerRef = useRef<AbortController | null>(null);

    /**
     * 点击外部关闭文件选择器
     */
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
                setShowFilePicker(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    /**
     * 核心发送逻辑
     * 发送消息到 AI，支持流式响应
     * @param text - 用户输入的文本
     */
    const submitChat = useCallback(async (text: string) => {
        // 检查输入是否为空或正在输入中
        if (!text.trim() || isTyping) return;

        // 构建上下文内容（将选中的文件内容作为上下文）
        const contextContent = contextFiles
            .map(name => `File: ${name}\n\`\`\`${files[name]?.language}\n${files[name]?.value}\n\`\`\``)
            .join('\n\n');

        // 构建最终提示词
        const finalPrompt = contextFiles.length > 0
            ? `Context Files:\n${contextContent}\n\nUser Question: ${text}`
            : text;

        // 添加用户消息到列表
        addMessage({ role: 'user', content: text });
        // 设置输入状态为 true
        setIsTyping(true);
        // 添加空的 AI 消息（用于流式更新）
        addMessage({ role: 'assistant', content: '' });

        // 发送新消息时，强制开启自动滚动
        setShouldAutoScroll(true);

        // 创建请求取消控制器
        const controller = new AbortController();
        abortControllerRef.current = controller;

        try {
            // 发送流式请求
            const response = await fetch(`${apiBaseUrl}/chat/stream`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ conversationId, message: finalPrompt }),
                signal: controller.signal,
            });

            if (!response.body) return;
            // 获取响应体的读取器
            const reader = response.body.getReader();
            // 文本解码器
            const decoder = new TextDecoder();
            // 累积的流式内容
            let streamedContent = '';

            // 循环读取流式数据
            while (true) {
                const { value, done } = await reader.read();
                if (done) break;
                // 解码数据并分割成行
                const lines = decoder.decode(value).split('\n');
                for (const line of lines) {
                    // 处理 SSE 格式的数据行
                    if (line.startsWith('data: ')) {
                        const dataStr = line.slice(6).trim();
                        // 结束标记
                        if (dataStr === '[DONE]') break;
                        try {
                            // 解析 JSON 数据并更新内容
                            const { content } = JSON.parse(dataStr);
                            streamedContent += content;
                            updateLastMessage(streamedContent);
                        } catch (e) { }
                    }
                }
            }
        } catch (err: any) {
            // 处理请求取消
            if (err.name === 'AbortError') console.log('Fetch aborted');
            else console.error(err);
        } finally {
            // 重置输入状态
            setIsTyping(false);
        }
    }, [contextFiles, files, conversationId, token, isTyping, addMessage, setIsTyping, updateLastMessage]);

    /**
     * 自动滚动逻辑
     * 当消息列表变化时自动滚动到底部
     */
    useEffect(() => {
        if (messages.length > 0 && shouldAutoScroll) {
            scrollRef.current?.scrollToIndex(messages.length - 1, { align: 'end' });
        }
    }, [messages.length, messages[messages.length - 1]?.content, shouldAutoScroll]);

    /**
     * 处理滚动事件
     * 检测用户是否手动滚动，控制自动滚动开关
     * @param offset - 滚动偏移量
     */
    const handleScroll = useCallback((offset: number) => {
        const vlist = scrollRef.current;
        if (!vlist) return;
        // 判断是否滚动到底部（允许 50px 误差）
        const isAtBottom = offset + vlist.viewportSize >= vlist.scrollSize - 20;
        setShouldAutoScroll(isAtBottom);
    }, []);

    /**
     * 监听一键纠错事件
     * 接收来自 Message 组件的错误信息并发送给 AI
     */
    useEffect(() => {
        const handleFixError = (e: Event) => {
            const customEvent = e as CustomEvent;
            const errorText = customEvent.detail.content;
            const prompt = `我遇到了以下编译错误，请结合我提供的文件上下文帮我修复：\n\n${errorText}`;
            submitChat(prompt);
        };
        window.addEventListener('fix-compiler-error', handleFixError);
        return () => window.removeEventListener('fix-compiler-error', handleFixError);
    }, [submitChat]);

    /**
     * 处理发送消息
     */
    const handleSend = () => {
        submitChat(input);
        setInput('');
        // 发送后重置输入框高度
        if (textareaRef.current) textareaRef.current.style.height = 'auto';
    };

    /**
     * 自动将当前选中文件添加到上下文
     */
    useEffect(() => {
        if (selectedFileName && !contextFiles.includes(selectedFileName)) {
            setContextFiles(prev => [...prev, selectedFileName]);
        }
    }, [selectedFileName]);

    /**
     * 输入框自适应高度
     */
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
        }
    }, [input]);

    return (
        <div className={styles.chatContainer}>
            {/* 聊天头部 */}
            <header className={styles.chatHeader}>
                <h2>AI 助手</h2>
            </header>
            <hr className={styles.divider} />

            {/* 消息列表区域 */}
            <div className={styles.messagesViewport}>
                <VList
                    ref={scrollRef}
                    className={styles.vlistContainer}
                    onScroll={handleScroll}
                >
                    {messages.map((msg, i) => (
                        <div key={i} className={`${styles.messageItem} ${styles[msg.role]}`}>
                            {/* 头像 */}
                            <div className={`${styles.avatar} ${styles[`${msg.role}Avatar`]}`}>
                                {msg.role === 'user' ? <User size={18} /> : <Bot size={18} />}
                            </div>
                            {/* 消息气泡 */}
                            <div className={styles.messageBubble}>
                                <MarkdownRenderer content={msg.content} />
                                {/* 输入中光标动画 */}
                                {isTyping && i === messages.length - 1 && msg.role === 'assistant' && (
                                    <span className={styles.typingCursor} />
                                )}
                            </div>
                        </div>
                    ))}
                </VList>
            </div>

            {/* 输入区域 */}
            <div className={styles.inputArea}>
                {/* 上下文文件栏 */}
                <div className={styles.contextBar}>
                    {/* 已选中的上下文文件标签 */}
                    {contextFiles.map(name => (
                        <div key={name} className={styles.contextChip}>
                            <FileCode size={12} />
                            <span className={styles.fileName}>{name}</span>
                            {/* 移除上下文按钮 */}
                            <button className={styles.removeBtn} onClick={() => setContextFiles(prev => prev.filter(f => f !== name))}>
                                <X size={12} />
                            </button>
                        </div>
                    ))}

                    {/* 文件选择器 */}
                    <div className={styles.filePickerContainer} ref={pickerRef}>
                        <button className={styles.addContextBtn} onClick={() => setShowFilePicker(!showFilePicker)}>
                            <Plus size={14} /> Context
                        </button>
                        {/* 文件选择下拉框 */}
                        {showFilePicker && (
                            <div className={styles.filePickerDropdown}>
                                <div className={styles.dropdownHeader}>选择文件作为上下文</div>
                                {Object.keys(files).map(name => (
                                    <div
                                        key={name}
                                        className={`${styles.dropdownItem} ${contextFiles.includes(name) ? styles.selected : ''}`}
                                        onClick={() => {
                                            if (!contextFiles.includes(name)) setContextFiles([...contextFiles, name]);
                                            setShowFilePicker(false);
                                        }}
                                    >
                                        <FileCode size={14} />
                                        <span>{name}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* 输入框和发送按钮 */}
                <div className={styles.inputWrapper}>
                    <textarea
                        ref={textareaRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        // 按 Enter 发送，Shift+Enter 换行
                        onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
                        placeholder="问问我有关代码的问题..."
                        rows={1}
                    />
                    <div className={styles.buttonGroup}>
                        {/* 根据输入状态显示停止或发送按钮 */}
                        {isTyping ? (
                            <button onClick={() => abortControllerRef.current?.abort()} className={`${styles.actionButton} ${styles.stopBtn}`}>
                                <Square size={16} fill="currentColor" />
                            </button>
                        ) : (
                            <button onClick={handleSend} disabled={!input.trim()} className={`${styles.actionButton} ${styles.sendBtn}`}>
                                <Send size={16} />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AIChat;
