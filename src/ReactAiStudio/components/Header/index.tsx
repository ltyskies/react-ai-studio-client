/**
 * @file src/ReactAiStudio/components/Header/index.tsx
 * @description 顶部导航栏组件
 * 包含 Logo、AI 帮助开关、分享链接、下载代码、退出登录等功能
 * @author React AI Studio
 */

// 样式文件
import styles from './index.module.scss'

// 第三方库 - 剪贴板复制
import copy from 'copy-to-clipboard';

// 静态资源 - Logo 图标
import logoSvg from './icons/logo.svg';

// React 核心库 - Hooks
import { useContext } from 'react';

// 项目内部 Context - AI Studio 全局状态
import { AIStudioContext } from '../../AIStudioContext';

// Ant Design 图标
import {
    DownloadOutlined,
    ShareAltOutlined,
    LogoutOutlined
} from '@ant-design/icons';

// Ant Design 组件
import { message, Popconfirm } from 'antd';

// 项目内部模块 - 工具函数
import { downloadFiles } from '../../utils';

/**
 * 顶部导航栏组件
 * 提供应用 Logo、AI 帮助切换、分享、下载、退出等功能
 */
export default function Header() {
    // 从 Context 获取文件列表、AI 面板状态和切换方法
    const { isShow, setIsShow, files } = useContext(AIStudioContext);

    /**
     * 处理退出登录
     * 清除本地 Token 并刷新页面
     */
    const handleLogout = () => {
        localStorage.removeItem('token');
        message.success('已退出登录');
        window.location.reload();
    };

    return (
        <div className={styles.header}>
            {/* Logo 区域 */}
            <div className={styles.logo}>
                <img alt='logo' src={logoSvg} />
                <span>React AI Studio</span>
                {/* AI 帮助开关按钮 */}
                <span
                    onClick={() => setIsShow(!isShow)}
                    style={{
                        cursor: 'pointer',
                        fontWeight: 500,
                        color: isShow ? '#1677ff' : 'inherit',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        marginLeft: '50px',
                        transition: 'all 0.2s',
                        userSelect: 'none',
                        display: 'inline-flex',
                        alignItems: 'center',
                    }}
                    className={styles.aiButton}
                >
                    AI 帮助
                </span>
            </div>

            {/* 右侧功能按钮区域 */}
            <div className={styles.links} style={{ display: 'flex', alignItems: 'center' }}>
                {/* 分享链接按钮 */}
                <ShareAltOutlined
                    title='分享'
                    style={{ marginLeft: '16px', fontSize: '18px', cursor: 'pointer' }}
                    onClick={() => {
                        // 复制当前页面 URL 到剪贴板
                        copy(window.location.href)
                        message.success('分享链接已复制')
                    }}
                />

                {/* 下载代码按钮 */}
                <DownloadOutlined
                    title='下载代码'
                    style={{ marginLeft: '16px', fontSize: '18px', cursor: 'pointer' }}
                    onClick={async () => {
                        // 下载所有文件为 ZIP
                        await downloadFiles(files);
                        message.success('下载完成')
                    }}
                />

                {/* 退出登录按钮 */}
                <Popconfirm
                    title="退出登录"
                    description="确定要退出吗？"
                    onConfirm={handleLogout}
                    okText="确定"
                    cancelText="取消"
                    placement="bottomRight"
                    arrow={false}
                >
                    <LogoutOutlined
                        title='退出登录'
                        style={{ marginLeft: '16px', fontSize: '18px', cursor: 'pointer', marginRight: '8px' }}
                    />
                </Popconfirm>
            </div>
        </div>
    )
}
