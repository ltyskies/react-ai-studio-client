/**
 * @file src/ReactAiStudio/components/Preview/index.tsx
 * @description 代码预览组件
 * 通过 Web Worker 编译代码，在 iframe 中实时预览运行效果
 * @author React AI Studio
 */

// React 核心库 - Hooks
import { useContext, useEffect, useRef, useState } from "react"

// 项目内部 Context - AI Studio 全局状态
import { AIStudioContext } from "../../AIStudioContext"

// 静态资源 - iframe HTML 模板
import iframeRaw from './iframe.html?raw'

// 项目内部常量 - Import Map 文件名
import { IMPORT_MAP_FILE_NAME } from "../../files";

// 项目内部组件 - 消息提示
import { Message } from "../Message";

// Web Worker - 代码编译器
import CompilerWorker from './compiler.worker?worker'

// 第三方库 - 防抖函数
import { debounce } from "lodash-es";

/**
 * Worker 消息数据接口
 */
interface MessageData {
    data: {
        type: string
        message: string
    }
}

/**
 * 代码预览组件
 * 编译代码并在 iframe 中显示运行结果
 */
export default function Preview() {
    // 从 Context 获取所有文件
    const { files } = useContext(AIStudioContext)

    // 编译后的代码
    const [compiledCode, setCompiledCode] = useState('')
    // 编译错误信息
    const [error, setError] = useState('')

    // Web Worker 引用
    const compilerWorkerRef = useRef<Worker>(null);

    /**
     * 初始化 Web Worker
     * 监听 Worker 返回的编译结果
     */
    useEffect(() => {
        if (!compilerWorkerRef.current) {
            compilerWorkerRef.current = new CompilerWorker();
            compilerWorkerRef.current.addEventListener('message', ({ data }) => {
                console.log('worker', data);
                // 处理编译完成的代码
                if (data.type === 'COMPILED_CODE') {
                    setCompiledCode(data.data);
                }
            })
        }
    }, []);

    /**
     * 文件变化时触发编译（带防抖）
     */
    useEffect(debounce(() => {
        compilerWorkerRef.current?.postMessage(files)
    }, 500), [files]);

    /**
     * 生成 iframe URL
     * 将 Import Map 和编译后的代码注入到 HTML 模板中
     * @returns Blob URL
     */
    const getIframeUrl = () => {
        const res = iframeRaw.replace(
            // 替换 Import Map
            '<script type="importmap"></script>',
            `<script type="importmap">${
                files[IMPORT_MAP_FILE_NAME].value
            }</script>`
        ).replace(
            // 替换应用代码
            '<script type="module" id="appSrc"></script>',
            `<script type="module" id="appSrc">${compiledCode}</script>`,
        )
        // 创建 Blob URL
        return URL.createObjectURL(new Blob([res], { type: 'text/html' }))
    }

    // iframe URL 状态
    const [iframeUrl, setIframeUrl] = useState(getIframeUrl());

    /**
     * Import Map 或编译代码变化时更新 iframe
     */
    useEffect(() => {
        setIframeUrl(getIframeUrl())
    }, [files[IMPORT_MAP_FILE_NAME].value, compiledCode]);

    /**
     * 处理 iframe 发送的消息
     * 主要处理运行时错误
     * @param msg - 消息对象
     */
    const handleMessage = (msg: MessageData) => {
        const { type, message } = msg.data
        if (type === 'ERROR') {
            setError(message)
        }
    }

    /**
     * 监听 iframe 消息
     */
    useEffect(() => {
        window.addEventListener('message', handleMessage)
        return () => {
            window.removeEventListener('message', handleMessage)
        }
    }, [])

    return (
        <div style={{ height: '100%' }}>
            {/* 预览 iframe */}
            <iframe
                src={iframeUrl}
                style={{
                    width: '100%',
                    height: '100%',
                    padding: 0,
                    border: 'none',
                }}
            />
            {/* 错误消息提示 */}
            <Message type='error' content={error} />
        </div>
    )
}
