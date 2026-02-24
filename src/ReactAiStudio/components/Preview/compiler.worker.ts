/**
 * @file src/ReactAiStudio/components/Preview/compiler.worker.ts
 * @description 代码编译 Web Worker
 * 在后台线程中编译 TypeScript/TSX 代码为 JavaScript，支持模块解析
 * @author React AI Studio
 */

// Babel 独立版 - 用于代码转换
import { transform } from '@babel/standalone'

// 项目内部模块 - 类型定义
import type { File, Files } from '../../AIStudioContext';

// 项目内部常量 - 入口文件名
import { ENTRY_FILE_NAME } from '../../files'

// Babel 核心类型
import type { PluginObj } from '@babel/core';

/**
 * 代码转换前预处理
 * 自动添加 React 导入（如果缺少）
 * @param filename - 文件名
 * @param code - 源代码
 * @returns 处理后的代码
 */
export const beforeTransformCode = (filename: string, code: string) => {
    let _code = code
    // 检测是否已有 React 导入
    const regexReact = /import\s+React((\s*,)|(\s+from))/g;
    // 如果是 JSX/TSX 文件且没有 React 导入，则自动添加
    if ((filename.endsWith('.jsx') || filename.endsWith('.tsx')) && !regexReact.test(code)) {
        _code = `import React from 'react';\n${code}`
    }
    return _code
}

/**
 * Babel 代码转换
 * 将 TypeScript/TSX 转换为 JavaScript
 * @param filename - 文件名
 * @param code - 源代码
 * @param files - 所有文件集合
 * @returns 转换后的代码
 */
export const babelTransform = (filename: string, code: string, files: Files) => {
    let _code = beforeTransformCode(filename, code);
    let result = ''
    try {
        result = transform(_code, {
            presets: ['react', 'typescript'],
            filename,
            plugins: [customResolver(files)],
            retainLines: true
        }).code!
    } catch (e) {
        console.error('编译出错', e);
    }
    return result
}

/**
 * 获取模块文件
 * 根据导入路径查找对应的文件
 * @param files - 所有文件集合
 * @param modulePath - 模块导入路径
 * @returns 文件对象
 */
const getModuleFile = (files: Files, modulePath: string) => {
    // 去掉 ./ 前缀获取模块名
    let moduleName = modulePath.split('./').pop() || ''
    // 如果没有后缀，尝试匹配对应的文件
    if (!moduleName.includes('.')) {
        const realModuleName = Object.keys(files).filter(key => {
            return key.endsWith('.ts')
                || key.endsWith('.tsx')
                || key.endsWith('.js')
                || key.endsWith('.jsx')
        }).find((key) => {
            return key.split('.').includes(moduleName)
        })
        if (realModuleName) {
            moduleName = realModuleName
        }
    }
    return files[moduleName]
}

/**
 * JSON 文件转换为 JS 模块
 * 将 JSON 内容导出为默认导出
 * @param file - 文件对象
 * @returns Blob URL
 */
const json2Js = (file: File) => {
    const js = `export default ${file.value}`
    return URL.createObjectURL(new Blob([js], { type: 'application/javascript' }))
}

/**
 * CSS 文件转换为 JS 模块
 * 动态创建 style 标签插入样式
 * @param file - 文件对象
 * @returns Blob URL
 */
const css2Js = (file: File) => {
    const randomId = new Date().getTime()
    const js = `
(() => {
    const stylesheet = document.createElement('style')
    stylesheet.setAttribute('id', 'style_${randomId}_${file.name}')
    document.head.appendChild(stylesheet)

    const styles = document.createTextNode(\`${file.value}\`)
    stylesheet.innerHTML = ''
    stylesheet.appendChild(styles)
})()
    `
    return URL.createObjectURL(new Blob([js], { type: 'application/javascript' }))
}

/**
 * 自定义模块解析插件
 * 处理相对路径导入，将本地文件转换为 Blob URL
 * @param files - 所有文件集合
 * @returns Babel 插件对象
 */
function customResolver(files: Files): PluginObj {
    return {
        visitor: {
            ImportDeclaration(path: { node: { source: { value: string; }; }; }) {
                const modulePath = path.node.source.value
                // 只处理相对路径导入
                if (modulePath.startsWith('.')) {
                    const file = getModuleFile(files, modulePath)
                    if (!file)
                        return

                    // 根据文件类型转换导入路径
                    if (file.name.endsWith('.css')) {
                        // CSS 文件转换为 JS 模块
                        path.node.source.value = css2Js(file)
                    } else if (file.name.endsWith('.json')) {
                        // JSON 文件转换为 JS 模块
                        path.node.source.value = json2Js(file)
                    } else {
                        // JS/TS 文件递归编译后转换为 Blob URL
                        path.node.source.value = URL.createObjectURL(
                            new Blob([babelTransform(file.name, file.value, files)], {
                                type: 'application/javascript',
                            })
                        )
                    }
                }
            }
        }
    }
}

/**
 * 编译入口函数
 * 从入口文件开始编译整个应用
 * @param files - 所有文件集合
 * @returns 编译后的代码
 */
export const compile = (files: Files) => {
    const main = files[ENTRY_FILE_NAME]
    return babelTransform(ENTRY_FILE_NAME, main.value, files)
}

/**
 * 监听主线程消息
 * 接收文件集合，返回编译结果
 */
self.addEventListener('message', async ({ data }) => {
    try {
        self.postMessage({
            type: 'COMPILED_CODE',
            data: compile(data)
        })
    } catch (e) {
        self.postMessage({ type: 'ERROR', error: e })
    }
})
