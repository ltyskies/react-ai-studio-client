import './index.scss'

const ChatSkeleton = () => {
    return (
        <div className="chat-skeleton skeleton">
            <div className="chat-header-skeleton">
                <span>AI助手</span>
            </div>
            <div className="messages-viewport-skeleton"></div>
        </div>
    );
}
export default ChatSkeleton;