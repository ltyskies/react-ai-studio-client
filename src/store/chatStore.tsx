import { create } from 'zustand';
import { produce } from 'immer';

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatState {
  conversationId: number | string;
  messages: Message[];
  isTyping: boolean;
  setConversationId: (id: number | string) => void;
  addMessage: (msg: Message) => void;
  updateLastMessage: (content: string) => void;
  setIsTyping: (status: boolean) => void;
  clearHistory: () => void;
}

export const useChatStore = create<ChatState>()(
    (set) => ({
      conversationId: 4,
      messages: [],
      isTyping: false,

      setConversationId: (id) => set({ conversationId: id }),

      setIsTyping: (status) => set({ isTyping: status }),

      addMessage: (msg) => 
        set(produce((state: ChatState) => {
          state.messages.push(msg);
        })),

      updateLastMessage: (content) =>
        set(produce((state: ChatState) => {
          const lastMsg = state.messages[state.messages.length - 1];
          if (lastMsg && lastMsg.role === 'assistant') {
            lastMsg.content = content;
          }
        })),

      clearHistory: () => set({ messages: [] }),
    }
  )
);