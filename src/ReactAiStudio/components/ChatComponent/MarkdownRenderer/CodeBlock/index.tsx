import { Check, Copy } from 'lucide-react';
import { memo, useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
// 👇 关键：导入具体的主题对象，这里取名为 prismTheme 以免和组件名冲突
import { oneLight as prismTheme } from 'react-syntax-highlighter/dist/esm/styles/prism';

const CodeBlock = memo(({ language, value }: { language: string; value: string }) => {
  const [copied, setCopied] = useState(false);

  const onCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="code-block-wrapper">
      <div className="code-header">
        <span>{language}</span>
        <button onClick={onCopy} className="copy-btn">
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? '已复制' : '复制'}
        </button>
      </div>
      <SyntaxHighlighter
        language={language}
        style={prismTheme} // ✅ 使用导入的主题对象
        customStyle={{ 
          margin: 0, 
          borderRadius: '0 0 8px 8px',
          background: '#f5f5f5', 
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