# React AI Studio 单元测试计划

## 项目概述

React AI Studio 是一个基于 React + Vite + TypeScript 构建的在线代码编辑器和 AI 助手集成开发环境。

## 测试范围

### 1. 工具函数模块 (src/ReactAiStudio/utils.ts)

| 函数名 | 测试场景 | 预期结果 |
|--------|----------|----------|
| fileName2Language | 输入: 'test.js' | 返回: 'javascript' |
| fileName2Language | 输入: 'test.jsx' | 返回: 'javascript' |
| fileName2Language | 输入: 'test.ts' | 返回: 'typescript' |
| fileName2Language | 输入: 'test.tsx' | 返回: 'typescript' |
| fileName2Language | 输入: 'test.json' | 返回: 'json' |
| fileName2Language | 输入: 'test.css' | 返回: 'css' |
| fileName2Language | 输入: 'test.unknown' | 返回: 'javascript' (默认) |
| fileName2Language | 输入: '' | 返回: 'javascript' (默认) |
| fileName2Language | 输入: 'no-extension' | 返回: 'javascript' (默认) |
| compress/uncompress | 压缩后再解压 | 数据保持一致 |
| compress/uncompress | 空字符串 | 正确处理 |
| compress/uncompress | 包含中文 | 正确处理 |
| compress/uncompress | 大文本 | 正确处理 |

### 2. Token 管理模块 (src/utils/token.ts)

| 函数名 | 测试场景 | 预期结果 |
|--------|----------|----------|
| setToken | 设置 token | localStorage.setItem 被调用 |
| getToken | 获取存在的 token | 返回 token 值 |
| getToken | 获取不存在的 token | 返回 null |
| removeToken | 删除 token | localStorage.removeItem 被调用 |

### 3. Store 模块

#### userStore (src/store/userStore.tsx)

| 测试项 | 测试场景 | 预期结果 |
|--------|----------|----------|
| 初始状态 | 默认值 | id = 1 |
| setUserId | 设置 id = 5 | state.id = 5 |
| setUserId | 多次设置 | 状态正确更新 |

#### chatStore (src/store/chatStore.tsx)

| 测试项 | 测试场景 | 预期结果 |
|--------|----------|----------|
| 初始状态 | 默认值 | conversationId = 4, messages = [], isTyping = false |
| setConversationId | 设置 id = 10 | state.conversationId = 10 |
| addMessage | 添加用户消息 | messages 长度 +1 |
| addMessage | 添加 AI 消息 | messages 长度 +1 |
| updateLastMessage | 更新最后一条 AI 消息 | 内容更新 |
| updateLastMessage | 最后一条不是 AI 消息 | 不更新 |
| setIsTyping | 设置 true | isTyping = true |
| clearHistory | 清空历史 | messages = [] |

### 4. API 模块

#### user.ts (src/apis/user.ts)

| 函数名 | 测试场景 | 预期结果 |
|--------|----------|----------|
| loginAPI | 正常登录 | POST /user/login, 携带 email/password |
| loginAPI | 网络错误 | 抛出异常 |

#### chat.ts (src/apis/chat.ts)

| 函数名 | 测试场景 | 预期结果 |
|--------|----------|----------|
| createNewConversationAPI | 创建对话 | POST /chat/conversation, 携带 userId |
| getConversationDetailAPI | 获取详情 | GET /chat/conversation?userId=&id= |

### 5. 组件测试

#### AuthRoute (src/components/AuthRoute.tsx)

| 测试场景 | 预期结果 |
|----------|----------|
| 有 Token | 渲染子组件 |
| 无 Token | 重定向到 /login |

### 6. 文件管理模块 (src/ReactAiStudio/files.ts)

| 测试项 | 测试场景 | 预期结果 |
|--------|----------|----------|
| initFiles | 检查初始文件 | 包含 ENTRY_FILE_NAME, APP_COMPONENT_FILE_NAME 等 |
| 常量 | 检查常量值 | 值正确 |

## 测试文件结构

```
src/
├── test/
│   └── setup.ts              # 测试环境配置
├── ReactAiStudio/
│   ├── utils.ts
│   └── utils.test.ts         # 工具函数测试
├── utils/
│   ├── token.ts
│   ├── token.test.ts         # Token 测试
│   └── request.test.ts       # 请求封装测试
├── store/
│   ├── userStore.test.tsx    # User Store 测试
│   └── chatStore.test.tsx    # Chat Store 测试
├── apis/
│   ├── user.test.ts          # User API 测试
│   └── chat.test.ts          # Chat API 测试
└── components/
    └── AuthRoute.test.tsx    # 路由守卫测试
```

## 依赖安装

```bash
pnpm add -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom @vitest/coverage-v8 msw
```

## 配置变更

### package.json 添加脚本
```json
{
  "scripts": {
    "test": "vitest",
    "test:watch": "vitest --watch",
    "test:coverage": "vitest --coverage",
    "test:ui": "vitest --ui"
  }
}
```

### 新增 vitest.config.ts
- 配置 jsdom 环境
- 配置 setup 文件
- 配置路径别名
- 配置覆盖率

### 新增 src/test/setup.ts
- 配置 localStorage Mock
- 配置 window.location Mock
- 导入 jest-dom 扩展

## 预期覆盖率

| 模块 | 目标覆盖率 |
|------|-----------|
| utils.ts | 100% |
| token.ts | 100% |
| userStore | 100% |
| chatStore | 90%+ |
| apis | 80%+ |
| AuthRoute | 80%+ |

## 执行计划

1. **Phase 1**: 配置测试环境
   - 安装依赖
   - 创建 vitest.config.ts
   - 创建 setup.ts

2. **Phase 2**: 工具函数测试
   - utils.test.ts
   - token.test.ts

3. **Phase 3**: Store 测试
   - userStore.test.tsx
   - chatStore.test.tsx

4. **Phase 4**: API 测试
   - user.test.ts
   - chat.test.ts
   - request.test.ts

5. **Phase 5**: 组件测试
   - AuthRoute.test.tsx

6. **Phase 6**: 验证与优化
   - 运行所有测试
   - 检查覆盖率
   - 修复问题

## 风险评估

| 风险 | 影响 | 缓解措施 |
|------|------|----------|
| Monaco Editor 难以测试 | 低 | 跳过 Editor 组件测试 |
| Web Worker 测试复杂 | 低 | 跳过 Worker 测试 |
| 浏览器 API Mock | 中 | 完善 setup.ts Mock |

## 验收标准

- [ ] 所有测试用例通过
- [ ] 工具函数覆盖率达到 100%
- [ ] Store 覆盖率达到 90%+
- [ ] API 覆盖率达到 80%+
- [ ] 组件覆盖率达到 80%+
- [ ] CI 集成测试命令
