/**
 * @file src/ReactAiStudio/index.tsx
 * @description React AI Studio 主页面组件
 * 整合代码编辑器、预览区和 AI 聊天面板，提供完整的在线代码开发环境
 * @author React AI Studio
 */

// 第三方库 - 可拖拽分栏布局
import { Allotment } from "allotment";
import "allotment/dist/style.css";

// 项目内部组件 - 顶部导航栏
import Header from "./components/Header";

// 样式文件
import "./index.scss";

// React 核心库 - Hooks
import { lazy, Suspense, useContext, useEffect } from "react";

// 项目内部 Context - AI Studio 全局状态
import { AIStudioContext } from "./AIStudioContext";

// 项目内部模块 - API 接口
import { createNewConversationAPI } from "../apis/chat";

// 项目内部模块 - 状态管理
import useUserStore from "../store/userStore";
import { useChatStore } from "../store/chatStore";

// 项目内部组件 - 骨架屏
import CodeEditorSkeleton from "./components/Skeleton/CodeEditorSkeleton";
import PreviewSkeleton from "./components/Skeleton/PreviewSkeleton";
import ChatSkeleton from "./components/Skeleton/ChatSkeleton";

/**
 * 懒加载组件
 * 优化首屏加载性能，按需加载以下组件：
 * - CodeEditor: 代码编辑器
 * - Preview: 代码预览
 * - ChatComponent: AI 聊天面板
 */
const CodeEditor = lazy(() => import("./components/CodeEditor"));
const Preview = lazy(() => import("./components/Preview"));
const ChatComponent = lazy(() => import("./components/ChatComponent"));

/**
 * React AI Studio 主组件
 * 页面布局：顶部导航 + 三栏编辑器（代码编辑器 | 预览区 | AI 聊天面板）
 */
export default function ReactAiStudio() {
    // 从 Context 获取 AI 聊天面板显示状态
    const { isShow } = useContext(AIStudioContext);

    // 从用户状态管理获取当前用户ID
    const { id } = useUserStore();

    // 从聊天状态管理获取设置对话ID的方法
    const { setConversationId } = useChatStore();

    /**
     * 初始化对话
     * 组件挂载时自动创建新的对话会话
     */
    useEffect(() => {
        /**
         * 创建新对话的异步函数
         */
        const initializeConversation = async () => {
            try {
                // 调用 API 创建新对话
                const res = await createNewConversationAPI(id);
                // 保存对话ID到状态管理
                setConversationId(res.data);
            } catch (error) {
                console.error("Failed to create conversation:", error);
            }
        };

        // 执行初始化
        initializeConversation();
    }, [id, setConversationId]);

    return (
        // 主容器 - 使用 light 主题，全屏高度
        <div className="light" style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
            {/* 顶部导航栏 */}
            <Header />
            
            {/* 编辑器区域 - 占据剩余空间 */}
            <div style={{ flex: 1, position: 'relative' }}>
                <Allotment>
                    {/* 左侧面板 - 代码编辑器 */}
                    <Allotment.Pane minSize={200}>
                        <Suspense fallback={<CodeEditorSkeleton />}>
                            <CodeEditor />
                        </Suspense>
                    </Allotment.Pane>

                    {/* 中间面板 - 代码预览 */}
                    <Allotment.Pane minSize={200}>
                        <Suspense fallback={<PreviewSkeleton />}>
                            <Preview />
                        </Suspense>
                    </Allotment.Pane>

                    {/* 右侧面板 - AI 聊天面板（根据 isShow 状态动态显示） */}
                    {isShow && (
                        <Allotment.Pane preferredSize={300} minSize={100}>
                            <Suspense fallback={<ChatSkeleton />}>
                                <ChatComponent />
                            </Suspense>
                        </Allotment.Pane>
                    )}
                </Allotment>
            </div>
        </div>
    );
}
