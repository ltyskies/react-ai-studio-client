import { createBrowserRouter } from "react-router";
import App from "../ReactAiStudio";
import { AuthRoute } from "../components/AuthRoute";
import Login from "../login";
import NotFound from "../NotFound";

const router = createBrowserRouter([
    {
        path: '/index',
        element: <AuthRoute><App/></AuthRoute>,
    },
    {
        path: '/login',
        element: <Login />,
    },
  {
    path: "*",
    element: <NotFound/>
  }
])

export default router;