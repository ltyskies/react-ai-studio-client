import { memo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import CodeBlock from "./CodeBlock";
import styles from './index.module.scss'; // 改为引入 styles 对象

const MarkdownRenderer = memo(({ content }: { content: string }) => {
  return (
    <div className={styles.markdownBody}> {/* 使用 styles.markdownBody */}
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ node, inline, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || '');
            return !inline && match ? (
              <CodeBlock 
                language={match[1]} 
                value={String(children).replace(/\n$/, '')} 
                // 注意：如果 CodeBlock 内部使用了上述 SCSS 类名，
                // 确保 CodeBlock 也能访问到这些模块化类名，或者在 CodeBlock 内部定义样式
              />
            ) : (
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