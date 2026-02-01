import styles from './index.module.scss';

const ChatSkeleton = () => {
    return (
        <div className={`${styles.chatSkeleton} skeleton`}>
            <div className={styles.chatHeaderSkeleton}>
                <span>AI助手</span>
            </div>
            <div className={styles.messagesViewportSkeleton}></div>
        </div>
    );
}

export default ChatSkeleton;