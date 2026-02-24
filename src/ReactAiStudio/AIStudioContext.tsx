/**
 * @file src/ReactAiStudio/AIStudioContext.tsx
 * @description AI Studio 全局状态管理 Context
 * 管理文件系统、选中文件、AI 面板显示状态等全局状态
 * 支持 URL Hash 持久化，刷新页面后文件内容不丢失
 * @author React AI Studio
 */

// React 核心库
import { createContext, useEffect, useState, type PropsWithChildren } from 'react'

// 项目内部模块 - 工具函数
import { compress, fileName2Language, uncompress } from './utils'

// 项目内部模块 - 初始文件
import { initFiles } from './files'

/**
 * 文件对象接口
 * @property name - 文件名
 * @property value - 文件内容
 * @property language - 文件语言类型（用于 Monaco Editor 语法高亮）
 */
export interface File {
    name: string
    value: string
    language: string
}

/**
 * 文件集合接口
 * 使用对象形式存储所有文件，键为文件名
 */
export interface Files {
    [key: string]: File
}

/**
 * AI Studio Context 接口
 * 定义全局状态的类型结构
 */
export interface AIStudioContext {
    // 文件相关
    files: Files                    // 所有文件对象
    selectedFileName: string        // 当前选中的文件名
    setSelectedFileName: (fileName: string) => void  // 设置选中文件
    setFiles: (files: Files) => void                 // 设置所有文件
    addFile: (fileName: string) => void              // 添加新文件
    removeFile: (fileName: string) => void           // 删除文件
    updateFileName: (oldFieldName: string, newFieldName: string) => void  // 重命名文件
    
    // AI 面板显示状态
    isShow: boolean                 // AI 聊天面板是否显示
    setIsShow: (show: boolean) => void  // 设置 AI 面板显示状态
}

/**
 * 创建 Context 默认值
 */
export const AIStudioContext = createContext<AIStudioContext>({
    selectedFileName: 'App.tsx',
} as AIStudioContext)

/**
 * 从 URL Hash 中解析文件数据
 * 支持页面刷新后恢复文件内容
 * @returns 解析后的文件对象，解析失败返回 undefined
 */
const getFilesFromUrl = () => {
    let files: Files | undefined
    try {
        // 获取 URL Hash（去掉开头的 #）
        const hash = uncompress(decodeURIComponent(window.location.hash.slice(1)))
        // 解析 JSON
        files = JSON.parse(hash)
    } catch (error) {
        console.error(error)
    }
    return files
}

/**
 * AI Studio Provider 组件
 * 提供全局状态管理，包裹整个应用
 * @param props - 包含子组件的 props
 */
export const AIStudioProvider = (props: PropsWithChildren) => {
    const { children } = props
    
    // 文件列表状态 - 优先从 URL Hash 恢复，否则使用默认文件
    const [files, setFiles] = useState<Files>(getFilesFromUrl() || initFiles)
    
    // 当前选中的文件名
    const [selectedFileName, setSelectedFileName] = useState('App.tsx')
    
    // AI 聊天面板显示状态
    const [isShow, setIsShow] = useState(false)

    /**
     * 添加新文件
     * @param name - 新文件名
     */
    const addFile = (name: string) => {
        files[name] = {
            name,
            language: fileName2Language(name),
            value: '',
        }
        setFiles({ ...files })
    }

    /**
     * 删除文件
     * @param name - 要删除的文件名
     */
    const removeFile = (name: string) => {
        delete files[name]
        setFiles({ ...files })
    }

    /**
     * 重命名文件
     * @param oldFieldName - 原文件名
     * @param newFieldName - 新文件名
     */
    const updateFileName = (oldFieldName: string, newFieldName: string) => {
        // 参数校验
        if (!files[oldFieldName] || newFieldName === undefined || newFieldName === null) return
        
        // 解构旧文件数据
        const { [oldFieldName]: value, ...rest } = files
        
        // 创建新文件对象
        const newFile = {
            [newFieldName]: {
                ...value,
                language: fileName2Language(newFieldName),
                name: newFieldName,
            },
        }
        
        // 更新文件列表
        setFiles({
            ...rest,
            ...newFile,
        })
    }

    /**
     * 文件变化时同步到 URL Hash
     * 实现页面刷新后文件内容不丢失
     */
    useEffect(() => {
        // 压缩文件数据
        const hash = compress(JSON.stringify(files))
        // 设置到 URL Hash
        window.location.hash = encodeURIComponent(hash)
    }, [files])

    return (
        <AIStudioContext.Provider
            value={{
                // AI 面板状态
                isShow,
                setIsShow,
                // 文件相关状态和方法
                files,
                selectedFileName,
                setSelectedFileName,
                setFiles,
                addFile,
                removeFile,
                updateFileName,
            }}
        >
            {children}
        </AIStudioContext.Provider>
    )
}
