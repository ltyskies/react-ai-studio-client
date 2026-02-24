/**
 * @file src/ReactAiStudio/components/CodeEditor/index.tsx
 * @description 代码编辑器容器组件
 * 整合文件标签列表和 Monaco 编辑器，提供代码编辑功能
 * @author React AI Studio
 */

// React 核心库 - Hooks
import { useContext } from "react";

// 项目内部组件 - Monaco 编辑器
import Editor from "./Editor";

// 项目内部组件 - 文件标签列表
import FileNameList from "./FileNameList";

// 项目内部 Context - AI Studio 全局状态
import { AIStudioContext } from "../../AIStudioContext";

// 第三方库 - 防抖函数
import { debounce } from "lodash-es";

/**
 * 代码编辑器容器组件
 * 包含文件标签列表和 Monaco 代码编辑器
 * 支持文件切换和代码编辑（带防抖保存）
 */
export default function CodeEditor() {
    // 从 Context 获取文件列表、设置文件方法和当前选中文件
    const {
        files,
        setFiles,
        selectedFileName
    } = useContext(AIStudioContext)

    // 获取当前选中的文件对象
    const file = files[selectedFileName];

    /**
     * 编辑器内容变化处理函数
     * 更新文件内容到全局状态（带防抖）
     * @param value - 编辑器新内容
     */
    function onEditorChange(value?: string) {
        // 更新当前文件的内容
        files[file.name].value = value!
        // 更新全局文件状态
        setFiles({ ...files })
    }

    return (
        // 编辑器容器 - 垂直布局
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* 文件标签列表 */}
            <FileNameList />
            {/* Monaco 编辑器 - 使用防抖处理内容变化 */}
            <Editor
                file={file}
                onChange={debounce(onEditorChange, 500)}
                options={{
                    theme: `vs-light`
                }}
            />
        </div>
    )
}
