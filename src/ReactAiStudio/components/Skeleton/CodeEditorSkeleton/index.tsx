import styles from './index.module.scss';

const CodeEditorSkeleton = () => {
    return (
        <div className={styles.codeEditorSkeleton}>
            <div className={styles.fileListSkeleton}></div>
            <div className={`${styles.editorContentSkeleton} ${styles.skeleton}`}></div>
        </div>
    );
}

export default CodeEditorSkeleton;