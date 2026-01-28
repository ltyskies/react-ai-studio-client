import classnames from 'classnames'
import React, { useEffect, useState } from 'react'

import styles from './index.module.scss'
import { AIStudioContext } from '../../AIStudioContext'

export interface MessageProps {
    type: 'error' | 'warn'
    content: string
}

// Message 组件
export const Message: React.FC<MessageProps> = (props) => {
  const { type, content } = props;
  const [visible, setVisible] = useState(false);
  const { setIsShow } = React.useContext(AIStudioContext);

  useEffect(() => {
    setVisible(!!content);
  }, [content]);

  const handleFixClick = () => {
    setIsShow(true);
    console.log('一键纠错，发送内容：', content);
    setTimeout(() => {
      const event = new CustomEvent('fix-compiler-error', { 
        detail: { content } 
      });
      window.dispatchEvent(event);
    }, 300);
    // 发送一个自定义事件，把错误内容传出去

  };

  return visible ? (
    <div className={classnames(styles.msg, styles[type])}>
      <pre dangerouslySetInnerHTML={{ __html: content }}></pre>
      
      {/* 仅在 error 类型时展示一键纠错 */}
      {type === 'error' && (
        <button 
          className={styles.fixBtn} 
          onClick={handleFixClick}
          style={{ marginRight: '10px', cursor: 'pointer' }}
        >
          ✨ 一键纠错
        </button>
      )}

      <button className={styles.dismiss} onClick={() => setVisible(false)}>
        ✕
      </button>
    </div>
  ) : null;
};