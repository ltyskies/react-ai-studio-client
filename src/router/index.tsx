/**
 * @file src/router/index.tsx
 * @description 应用路由配置文件
 * 定义所有页面路由，包括登录页、主页面和 404 页面
 * @author React AI Studio
 */

// React Router - 浏览器路由创建
import { createBrowserRouter } from "react-router";

// 项目内部组件 - 路由守卫
import { AuthRoute } from "../components/AuthRoute";

// 项目内部页面组件
import Login from "../login";
import NotFound from "../notFound";

// 项目内部 Context 和主页面
import { AIStudioProvider } from "../ReactAiStudio/AIStudioContext";
import ReactAiStudio from "../ReactAiStudio";

// 样式文件
import './index.module.scss'; 

/**
 * 创建浏览器路由配置
 * 包含三个路由：
 * 1. /index - 主页面（需要登录）
 * 2. /login - 登录页面
 * 3. * - 404 页面
 */
const router = createBrowserRouter([
    {
        // 主页面路由 - 需要登录认证
        path: '/index',
        element: (
            <AuthRoute>
                <AIStudioProvider>
                    <ReactAiStudio />
                </AIStudioProvider>
            </AuthRoute>
        ),
    },
    {
        // 登录页面路由
        path: '/login',
        element: <Login />,
    },
    {
        // 404 页面路由 - 匹配所有未定义路径
        path: "*",
        element: <NotFound />
    }
]);

export default router;
