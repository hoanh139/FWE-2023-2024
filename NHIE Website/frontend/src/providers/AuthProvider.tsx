import React, {createContext, ReactNode, useState} from "react";
import { useNavigate } from "react-router-dom";
import { useLocalStorage } from "../hooks/useLocalStorage.ts";

export type LoginUserData = {
    email: string;
    password: string;
};
export type User = {
    email: string;
    firstName: string;
    id: string;
    lastName: string;
    iat: number;
    exp: number;
    iss: string;
};

export type Playlist = {
    id: string;
    name: string;
    playlistQuestions: PlaylistQuestion[];
}

export type PlaylistQuestion = {
    playlist: string,
    question: Question
}

export type Question = {
    id: string;
    content: string;
}


type AuthContext = {
    user: User | null;
    accessToken: string | null;
    isAuthenticated: boolean;
    loginError: string | null;
    onLogin: (loginData: LoginUserData) => void;
    onLogout: () => void;
};

const authContext = createContext<AuthContext | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [accessToken, setAccessToken] = useLocalStorage<string | null>(
        "accessToken",
        null,
    );
    const [loginError, setLoginError] = useState<string | null>(null);
    const navigate = useNavigate();

    const user = accessToken
        ? (JSON.parse(atob(accessToken.split(".")[1])) as User)
        : null;
    console.log("user", user);

    const onLogin = async (loginData: LoginUserData) => {
        try {
            const body = {
                email: loginData.email,
                password: loginData.password,
            };
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(body),
            });
            if (!res.ok) {
                return new Error("Login failed");
            }
            const resBody = await res.json();
            setAccessToken(resBody.accessToken);
            navigate("/home");
        } catch (error) {
            setLoginError("Login failed. Please check your email and password.");
        }
    };

    const onLogout = () => {
        setAccessToken(null);
        navigate("/");
    };
    return (
        <authContext.Provider
            value={{
                user,
                accessToken,
                isAuthenticated: false,
                loginError,
                onLogin,
                onLogout,
            }}
        >
            {children}
        </authContext.Provider>
    );
};

export const useAuth = () => {
    const auth = React.useContext(authContext);
    if (!auth) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return auth;
};
export const getUserPlaylists = async (userID: string) => {
    try {
        const response = await fetch(`/api/auth/${userID}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch player data: ${response.status}`);
        }

        const data = await response.json();
        const playlists = data["createdPlaylists"];

        if (playlists) {
            console.log("Playlists: ", playlists);
            return playlists;
        }

        return [];
    } catch (error) {
        console.log(`Failed to fetch user playlist: ${error}`);
        return [];
    }
};

