import { Allotment } from "allotment";
import "allotment/dist/style.css";
import Header from "./components/Header";
import "./index.scss";
import { lazy, Suspense, useContext, useEffect } from "react";
import { AIStudioContext } from "./AIStudioContext";
import { createNewConversationAPI } from "../apis/chat";
import useUserStore from "../store/userStore";
import { useChatStore } from "../store/chatStore";
import CodeEditorSkeleton from "./components/Skeleton/CodeEditorSkeleton";
import PreviewSkeleton from "./components/Skeleton/PreviewSkeleton";
import ChatSkeleton from "./components/Skeleton/ChatSkeleton";

const CodeEditor = lazy(() => import("./components/CodeEditor"));
const Preview = lazy(() => import("./components/Preview"));
const ChatComponent = lazy(() => import("./components/ChatComponent"));

export default function ReactAiStudio() {
    const { isShow } = useContext(AIStudioContext);

    const { id } = useUserStore();

    const { setConversationId } = useChatStore();
 
    useEffect(() => {
        const initializeConversation = async () => {
            try {
                const res = await createNewConversationAPI(id);
                setConversationId(res.data);
            } catch (error) {
                console.error("Failed to create conversation:", error);
            }
        };

        initializeConversation();
    }, [id, setConversationId]); 
    return (
        <div className="light" style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Header />
            <div style={{ flex: 1, position: 'relative' }}>
                <Allotment>
                    <Allotment.Pane minSize={200}>
                        <Suspense fallback={<CodeEditorSkeleton />}>
                            <CodeEditor />
                        </Suspense>
                    </Allotment.Pane>
                    
                    <Allotment.Pane minSize={200}>
                        <Suspense fallback={<PreviewSkeleton />}>
                            <Preview />
                        </Suspense>
                    </Allotment.Pane>

                    {/* 根据 isShow 状态动态渲染对话框面板 */}
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