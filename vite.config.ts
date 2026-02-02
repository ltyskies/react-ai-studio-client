import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'
import { chunkSplitPlugin } from 'vite-plugin-chunk-split'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    chunkSplitPlugin({
      customSplitting: {
        // 使用更具包容性的正则，匹配 node_modules 中的路径
        'monaco-vendor': [/node_modules\/monaco-editor/, /node_modules\/@monaco-editor/],
        'compiler-vendor': [/node_modules\/@babel/, /node_modules\/@typescript\/ata/],
        'antd-vendor': [/node_modules\/antd/, /node_modules\/@ant-design/],
        'react-vendor': [/node_modules\/(react|react-dom|react-router)/],
        'utils-vendor': [/node_modules\/(zustand|immer|lodash-es|axios|classnames)/],
        'markdown-vendor': [/node_modules\/(react-markdown|remark-gfm|react-syntax-highlighter)/],
        'ui-layout': [/node_modules\/(allotment|react-virtuoso|virtua|lucide-react)/],
        'file-tools': [/node_modules\/(jszip|fflate|file-saver)/],
      }
    })
  ],
  base: './',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  }
})
