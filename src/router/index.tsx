import { createBrowserRouter } from "react-router";
import { AuthRoute } from "../components/AuthRoute";
import Login from "../login";
import NotFound from "../notFound";
import { AIStudioProvider } from "../ReactAiStudio/AIStudioContext";
import ReactPlayground from "../ReactAiStudio";
import './index.module.scss'; 

const router = createBrowserRouter([
    {
        path: '/index',
        element: (
            <AuthRoute>
                <AIStudioProvider>
                    <ReactPlayground />
                </AIStudioProvider>
            </AuthRoute>
        ),
    },
    {
        path: '/login',
        element: <Login />,
    },
    {
        path: "*",
        element: <NotFound />
    }
]);

export default router;