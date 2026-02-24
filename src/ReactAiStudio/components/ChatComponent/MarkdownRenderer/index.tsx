/**
 * @file src/ReactAiStudio/components/ChatComponent/MarkdownRenderer/index.tsx
 * @description Markdown 渲染组件
 * 将 Markdown 文本渲染为 HTML，支持代码块高亮和 GitHub 风格 Markdown
 * @author React AI Studio
 */

// React 核心库 - memo 用于性能优化
import { memo } from "react";

// 第三方库 - Markdown 渲染
import ReactMarkdown from "react-markdown";

// 第三方库 - GitHub 风格 Markdown 插件
import remarkGfm from "remark-gfm";

// 项目内部组件 - 代码块组件
import CodeBlock from "./CodeBlock";

// 样式文件
import styles from './index.module.scss';

/**
 * Markdown 渲染组件属性接口
 */
interface MarkdownRendererProps {
    content: string;  // Markdown 内容
}

/**
 * Markdown 渲染组件
 * 使用 react-markdown 渲染 Markdown 内容
 * 支持代码块语法高亮、GitHub 风格表格等
 */
const MarkdownRenderer = memo(({ content }: MarkdownRendererProps) => {
    return (
        <div className={styles.markdownBody}>
            <ReactMarkdown
                // 使用 remark-gfm 插件支持 GitHub 风格 Markdown
                remarkPlugins={[remarkGfm]}
                // 自定义组件渲染
                components={{
                    /**
                     * 自定义代码组件渲染
                     * 区分行内代码和代码块
                     */
                    code({ node, inline, className, children, ...props }: any) {
                        // 提取语言类型
                        const match = /language-(\w+)/.exec(className || '');
                        // 如果是代码块且有语言标识，使用 CodeBlock 组件
                        return !inline && match ? (
                            <CodeBlock
                                language={match[1]}
                                value={String(children).replace(/\n$/, '')}
                            />
                        ) : (
                            // 行内代码使用默认样式
                            <code className={styles.inlineCode} {...props}>
                                {children}
                            </code>
                        );
                    },
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
});

export default MarkdownRenderer;
