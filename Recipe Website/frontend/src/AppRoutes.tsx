import { HomePage } from "./pages/home/HomePage.tsx";
import { CategoryPage } from "./pages/category/CategoryPage.tsx";
import { IngredientPage } from "./pages/ingredient/IngredientPage.tsx";
import { RecipeTablePage } from "./pages/recipes/RecipeTablePage.tsx";

import {
    Navigate,
    Route,
    RouteProps,
    Routes,} from "react-router-dom";
import {ReactElement} from "react";
import {RecipeEntryPage} from "./pages/recipeentry/RecipePage.tsx";
import SearchPage from "./pages/search/SearchPage.tsx";

export type RouteConfig = RouteProps & {
    path: string;
    element: ReactElement;
};
export const routes: RouteConfig[] = [
    {
        path: "/",
        element: <Navigate to="/home" replace />,
    },
    {
        path: "/home",
        element: <HomePage />,
    },
    {
        path: "/category",
        element: <CategoryPage />,
    },
    {
        path: "/ingredient",
        element: <IngredientPage />,
    },
    {
        path: "/recipe",
        element: <RecipeTablePage />,
    },
    {
        path: `/recipe/:name`,
        element: <RecipeEntryPage />,
    },
    {
        path: `/search`,
        element: <SearchPage />,
    },
];

const renderRouteMap = (route: RouteConfig) => {
    return <Route key={route.path} {...route} />;
};
export const AppRoutes = () => {
    return <Routes>{routes.map(renderRouteMap)}</Routes>;
};
