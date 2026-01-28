import { Allotment } from "allotment";
import "allotment/dist/style.css";
import Header from "./components/Header";
import CodeEditor from "./components/CodeEditor";
import Preview from "./components/Preview";
import ChatComponent from "./components/ChatComponent"; 
import "./index.scss";
import { useContext, useEffect } from "react";
import { AIStudioContext } from "./AIStudioContext";
import { createNewConversationAPI } from "../apis/chat";
import useUserStore from "../store/userStore";
import { useChatStore } from "../store/chatStore";

export default function ReactAiStudio() {
    const { isShow } = useContext(AIStudioContext);

    const { id } = useUserStore();

    const { setConversationId } = useChatStore();
 
    useEffect(() => {
        // 1. Define the async logic
        const initializeConversation = async () => {
            try {
                const res = await createNewConversationAPI(id);
                setConversationId(res.data);
            } catch (error) {
                console.error("Failed to create conversation:", error);
            }
        };

        // 2. Execute it
        initializeConversation();
    }, [id, setConversationId]); 
    return (
        <div className="light" style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Header />
            <div style={{ flex: 1, position: 'relative' }}>
                <Allotment>
                    <Allotment.Pane minSize={200}>
                        <CodeEditor />
                    </Allotment.Pane>
                    
                    <Allotment.Pane minSize={200}>
                        <Preview />
                    </Allotment.Pane>

                    {/* 根据 isShow 状态动态渲染对话框面板 */}
                    {isShow && (
                        <Allotment.Pane preferredSize={300} minSize={100}>
                          <ChatComponent />  
                        </Allotment.Pane>
                    )}
                </Allotment>
            </div>
        </div>
    );
}