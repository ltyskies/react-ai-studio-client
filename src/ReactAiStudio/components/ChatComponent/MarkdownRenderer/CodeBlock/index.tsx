import { Check, Copy } from 'lucide-react';
import { memo, useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight as prismTheme } from 'react-syntax-highlighter/dist/esm/styles/prism';
import styles from './index.module.scss';

const CodeBlock = memo(({ language, value }: { language: string; value: string }) => {
  const [copied, setCopied] = useState(false);

  const onCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={styles.codeBlockWrapper}>
      <div className={styles.codeHeader}>
        <span>{language}</span>
        <button onClick={onCopy} className={styles.copyBtn}>
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? '已复制' : '复制'}
        </button>
      </div>
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