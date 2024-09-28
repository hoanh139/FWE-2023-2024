import { RegisterPage } from "./pages/auth/RegisterPage.tsx";
import { LoginPage } from "./pages/auth/LoginPage.tsx";
import {
  Navigate,
  Route,
  RouteProps,
  Routes,
  useLocation,
} from "react-router-dom";
import { useAuth } from "./providers/AuthProvider.tsx";
import { HomePage } from "./pages/home/Home.tsx";
import { GamePage } from "./pages/Play/GamePage.tsx";
import {UserOverviewPage} from "./pages/user/UserOverviewPage.tsx";
import CreatePlaylistPage from "./pages/playlist/CreatePlaylistPage.tsx";
import EditPlaylistPage from "./pages/playlist/EditPlaylistPage.tsx";
import UserEditPage from "./pages/user/UserEditPage.tsx";

export type RouteConfig = RouteProps & {
  /**
   * Required route path.   * E.g. /home   */
  path: string;
  /**
     * Specify a private route if the route
     should only be accessible for authenticated users   */
  isPrivate?: boolean;
};
export const routes: RouteConfig[] = [
  {
    isPrivate: true,
    path: "/",
    element: <Navigate to="/auth/login" replace />,
    index: true,
  },
  {
    path: "/home",
    element: <HomePage />,
  },
  {
    path: "/auth/login",
    element: <LoginPage />,
  },
  {
    path: "/auth/register",
    element: <RegisterPage />,
  },
  {
    isPrivate: true,
    path: "/home",
    element: <HomePage />,
  },
  {
    isPrivate: true,
    path: "/user/overview",
    element: <UserOverviewPage />,
  },
  {
    isPrivate: true,
    path: "/user/edit-user-info",
    element: <UserEditPage />,
  },
  {
    isPrivate: true,
    path: "/user/create-playlist",
    element: <CreatePlaylistPage />,
  },
  {
    isPrivate: true,
    path: "/user/edit-playlist/:playlistId",
    element: <EditPlaylistPage />,
  },
  {
    isPrivate: true,
    path: "/game/:id",
    element: <GamePage />,
  },
];

export interface AuthRequiredProps {
  to?: string;
  children?: React.ReactNode;
}

export const AuthRequired: React.FC<AuthRequiredProps> = ({
  children,
  to = "/auth/login",
}) => {
  const { user } = useAuth();
  const { pathname } = useLocation();

  if (!user && pathname !== to) {
    return <Navigate to={to} replace />;
  }
  return <>{children}</>;
};

const renderRouteMap = (route: RouteConfig) => {
  const { isPrivate, element, ...rest } = route;
  console.log("isPrivate", isPrivate);
  const authRequiredElement = isPrivate ? (
    <AuthRequired>{element}</AuthRequired>
  ) : (
    element
  );
  return <Route key={route.path} element={authRequiredElement} {...rest} />;
};
export const AppRoutes = () => {
  return <Routes>{routes.map(renderRouteMap)}</Routes>;
};
