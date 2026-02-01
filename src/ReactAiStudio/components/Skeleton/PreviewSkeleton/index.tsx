import styles from './index.module.scss';

const PreviewSkeleton = () => {
    return (
        <div className={`${styles.previewSkeleton} ${styles.skeleton}`}>
            <span className={styles.loadingText}>预览中...</span>
        </div>
    );
}

export default PreviewSkeleton;