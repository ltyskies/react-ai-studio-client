import { memo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import CodeBlock from "./CodeBlock";
import styles from './index.module.scss'; 

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