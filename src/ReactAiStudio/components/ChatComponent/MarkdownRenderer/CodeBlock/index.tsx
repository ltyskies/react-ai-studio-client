/**
 * @file src/ReactAiStudio/components/ChatComponent/MarkdownRenderer/CodeBlock/index.tsx
 * @description 代码块组件
 * 使用 react-syntax-highlighter 实现代码语法高亮，支持复制功能
 * @author React AI Studio
 */

// 第三方库 - 图标
import { Check, Copy } from 'lucide-react';

// React 核心库 - memo 和 Hooks
import { memo, useState } from 'react';

// 第三方库 - 代码语法高亮
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';

// 第三方库 - 代码高亮主题
import { oneLight as prismTheme } from 'react-syntax-highlighter/dist/esm/styles/prism';

// 样式文件
import styles from './index.module.scss';

/**
 * 代码块组件属性接口
 */
interface CodeBlockProps {
    language: string;   // 编程语言
    value: string;      // 代码内容
}

/**
 * 代码块组件
 * 提供语法高亮和一键复制功能
 */
const CodeBlock = memo(({ language, value }: CodeBlockProps) => {
    // 复制状态
    const [copied, setCopied] = useState(false);

    /**
     * 处理复制操作
     * 将代码内容复制到剪贴板
     */
    const onCopy = () => {
        navigator.clipboard.writeText(value);
        setCopied(true);
        // 2 秒后重置复制状态
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className={styles.codeBlockWrapper}>
            {/* 代码块头部 - 显示语言和复制按钮 */}
            <div className={styles.codeHeader}>
                <span>{language}</span>
                <button onClick={onCopy} className={styles.copyBtn}>
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                    {copied ? '已复制' : '复制'}
                </button>
            </div>
            {/* 代码高亮显示 */}
            <SyntaxHighlighter
                language={language}
                style={prismTheme}
                customStyle={{
                    margin: 0,
                    borderRadius: '0 0 8px 8px',
                    background: 'transparent',
                    fontSize: '14px'
                }}
                codeTagProps={{
                    style: { color: '#000000', fontFamily: 'Fira Code, monospace' }
                }}
            >
                {value}
            </SyntaxHighlighter>
        </div>
    );
});

export default CodeBlock;
