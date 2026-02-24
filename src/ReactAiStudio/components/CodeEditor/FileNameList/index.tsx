/**
 * @file src/ReactAiStudio/components/CodeEditor/FileNameList/index.tsx
 * @description 文件标签列表组件
 * 显示所有打开的文件标签，支持切换、添加、删除、重命名文件
 * @author React AI Studio
 */

// React 核心库 - Hooks
import { useContext, useEffect, useState } from "react"

// 项目内部 Context - AI Studio 全局状态
import { AIStudioContext } from "../../../AIStudioContext"

// 项目内部组件 - 单个文件标签
import { FileNameItem } from "./FileNameItem"

// 样式文件
import styles from './index.module.scss'

// 项目内部常量 - 只读文件名
import { APP_COMPONENT_FILE_NAME, ENTRY_FILE_NAME, IMPORT_MAP_FILE_NAME } from "../../../files"

/**
 * 文件标签列表组件
 * 管理文件标签的显示、添加、删除和重命名
 */
export default function FileNameList() {
    // 从 Context 获取文件相关方法和状态
    const {
        files,
        removeFile,
        addFile,
        updateFileName,
        selectedFileName,
        setSelectedFileName
    } = useContext(AIStudioContext)

    // 标签列表状态
    const [tabs, setTabs] = useState([''])

    // 是否正在创建新文件
    const [creating, setCreating] = useState(false)

    /**
     * 文件变化时更新标签列表
     */
    useEffect(() => {
        setTabs(Object.keys(files))
    }, [files])

    /**
     * 处理文件重命名完成
     * @param name - 新文件名
     * @param prevName - 原文件名
     */
    const handleEditComplete = (name: string, prevName: string) => {
        updateFileName(prevName, name);
        setSelectedFileName(name);
        setCreating(false)
    }

    /**
     * 添加新文件
     * 生成随机文件名并进入编辑模式
     */
    const addTab = () => {
        // 生成随机文件名
        addFile('comp' + Math.random().toString().slice(2, 6) + 'tsx')
        setCreating(true)
    }

    /**
     * 删除文件
     * @param name - 要删除的文件名
     */
    const handleRemove = (name: string) => {
        removeFile(name)
        // 删除后切换到入口文件
        setSelectedFileName(ENTRY_FILE_NAME)
    }

    // 只读文件列表（不允许删除和重命名）
    const readonlyFileNames = [ENTRY_FILE_NAME, IMPORT_MAP_FILE_NAME, APP_COMPONENT_FILE_NAME];

    return (
        <div className={styles.tabs}>
            {/* 渲染所有文件标签 */}
            {
                tabs.map((item, index, arr) => (
                    <FileNameItem
                        key={item + index}
                        value={item}
                        // 最后一个标签如果是新建的，进入编辑模式
                        creating={creating && index === arr.length - 1}
                        // 只读文件不允许编辑
                        readonly={readonlyFileNames.includes(item)}
                        // 当前选中状态
                        actived={selectedFileName === item}
                        // 点击切换到该文件
                        onClick={() => setSelectedFileName(item)}
                        // 重命名完成回调
                        onEditComplete={(name: string) => handleEditComplete(name, item)}
                        // 删除文件回调
                        onRemove={() => {
                            handleRemove(item)
                        }}
                    >
                    </FileNameItem>
                ))
            }
            {/* 添加新文件按钮 */}
            <div className={styles.add} onClick={addTab}>
                +
            </div>
        </div>
    )
}
