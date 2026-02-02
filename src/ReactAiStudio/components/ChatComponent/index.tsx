import { useState, useRef, useEffect, useContext, useCallback } from 'react';
import { VList, type VListHandle } from 'virtua';
import { Send, Square, User, Bot, FileCode, X, Plus } from 'lucide-react';
import { useChatStore } from '../../../store/chatStore';
import { AIStudioContext } from '../../AIStudioContext'; 
import styles from './index.module.scss';
import { getToken } from '../../../utils/token';
import { apiBaseUrl } from '../../../utils/request';
import React from 'react';

const MarkdownRenderer = React.lazy(() => import('./MarkdownRenderer'));

const AIChat = () => {
  const { messages, conversationId, isTyping, addMessage, updateLastMessage, setIsTyping } = useChatStore();
  const { files, selectedFileName } = useContext(AIStudioContext);
  
  const [input, setInput] = useState('');
  const [contextFiles, setContextFiles] = useState<string[]>([]);
  const [showFilePicker, setShowFilePicker] = useState(false);
  
  // --- 滚动控制逻辑 ---
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const scrollRef = useRef<VListHandle>(null);
  
  const token = getToken();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const pickerRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // 点击外部关闭文件选择器
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setShowFilePicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 1. 核心发送逻辑
  const submitChat = useCallback(async (text: string) => {
    if (!text.trim() || isTyping) return;

    const contextContent = contextFiles
      .map(name => `File: ${name}\n\`\`\`${files[name]?.language}\n${files[name]?.value}\n\`\`\``)
      .join('\n\n');

    const finalPrompt = contextFiles.length > 0 
      ? `Context Files:\n${contextContent}\n\nUser Question: ${text}`
      : text;

    addMessage({ role: 'user', content: text });
    setIsTyping(true);
    addMessage({ role: 'assistant', content: '' });
    
    // 发送新消息时，强制开启自动滚动
    setShouldAutoScroll(true);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const response = await fetch(`${apiBaseUrl}/chat/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ conversationId, message: finalPrompt }),
        signal: controller.signal,
      });

      if (!response.body) return;
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let streamedContent = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const lines = decoder.decode(value).split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.slice(6).trim();
            if (dataStr === '[DONE]') break;
            try {
              const { content } = JSON.parse(dataStr);
              streamedContent += content;
              updateLastMessage(streamedContent);
            } catch (e) {}
          }
        }
      }
    } catch (err: any) {
      if (err.name === 'AbortError') console.log('Fetch aborted');
      else console.error(err);
    } finally {
      setIsTyping(false);
    }
  }, [contextFiles, files, conversationId, token, isTyping, addMessage, setIsTyping, updateLastMessage]);

  // 2. 自动滚动逻辑
  useEffect(() => {
    if (messages.length > 0 && shouldAutoScroll) {
      scrollRef.current?.scrollToIndex(messages.length - 1, { align: 'end' });
    }
  }, [messages.length, messages[messages.length - 1]?.content, shouldAutoScroll]);

  // 3. 处理滚动事件
  const handleScroll = useCallback((offset: number) => {
    const vlist = scrollRef.current;
    if (!vlist) return;
    const isAtBottom = offset + vlist.viewportSize >= vlist.scrollSize - 50; 
    setShouldAutoScroll(isAtBottom);
  }, []);

  // --- 其他辅助逻辑 ---
  useEffect(() => {
    const handleFixError = (e: Event) => {
      const customEvent = e as CustomEvent;
      const errorText = customEvent.detail.content;
      const prompt = `我遇到了以下编译错误，请结合我提供的文件上下文帮我修复：\n\n${errorText}`;
      submitChat(prompt);
    };
    window.addEventListener('fix-compiler-error', handleFixError);
    return () => window.removeEventListener('fix-compiler-error', handleFixError);
  }, [submitChat]);

  const handleSend = () => {
    submitChat(input);
    setInput('');
    // 发送后重置输入框高度
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  };

  useEffect(() => {
    if (selectedFileName && !contextFiles.includes(selectedFileName)) {
      setContextFiles(prev => [...prev, selectedFileName]);
    }
  }, [selectedFileName]);

  // 输入框自适应高度
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  }, [input]);

  return (
    <div className={styles.chatContainer}>
      <header className={styles.chatHeader}>
        <h2>AI 助手</h2>
      </header>
      <hr className={styles.divider} />
      
      <div className={styles.messagesViewport}>
        <VList 
          ref={scrollRef} 
          className={styles.vlistContainer}
          onScroll={handleScroll}
        >
          {messages.map((msg, i) => (
            <div key={i} className={`${styles.messageItem} ${styles[msg.role]}`}>
              <div className={`${styles.avatar} ${styles[`${msg.role}Avatar`]}`}>
                {msg.role === 'user' ? <User size={18} /> : <Bot size={18} />}
              </div>
              <div className={styles.messageBubble}>
                <MarkdownRenderer content={msg.content} />
                {isTyping && i === messages.length - 1 && msg.role === 'assistant' && (
                  <span className={styles.typingCursor} />
                )}
              </div>
            </div>
          ))}
        </VList>
      </div>

      <div className={styles.inputArea}>
        <div className={styles.contextBar}>
          {contextFiles.map(name => (
            <div key={name} className={styles.contextChip}>
              <FileCode size={12} />
              <span className={styles.fileName}>{name}</span>
              <button className={styles.removeBtn} onClick={() => setContextFiles(prev => prev.filter(f => f !== name))}>
                <X size={12} />
              </button>
            </div>
          ))}
          
          <div className={styles.filePickerContainer} ref={pickerRef}>
            <button className={styles.addContextBtn} onClick={() => setShowFilePicker(!showFilePicker)}>
              <Plus size={14} /> Context
            </button>
            {showFilePicker && (
              <div className={styles.filePickerDropdown}>
                <div className={styles.dropdownHeader}>选择文件作为上下文</div>
                {Object.keys(files).map(name => (
                  <div 
                    key={name} 
                    className={`${styles.dropdownItem} ${contextFiles.includes(name) ? styles.selected : ''}`}
                    onClick={() => {
                      if(!contextFiles.includes(name)) setContextFiles([...contextFiles, name]);
                      setShowFilePicker(false);
                    }}
                  >
                    <FileCode size={14} />
                    <span>{name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className={styles.inputWrapper}>
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
            placeholder="问问我有关代码的问题..."
            rows={1}
          />
          <div className={styles.buttonGroup}>
            {isTyping ? (
              <button onClick={() => abortControllerRef.current?.abort()} className={`${styles.actionButton} ${styles.stopBtn}`}>
                <Square size={16} fill="currentColor" />
              </button>
            ) : (
              <button onClick={handleSend} disabled={!input.trim()} className={`${styles.actionButton} ${styles.sendBtn}`}>
                <Send size={16} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIChat;