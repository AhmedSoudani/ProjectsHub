import { useCallback, useEffect, useMemo, useState } from "react";
import { api, clearTokens, hasToken, setTokens } from "../api";
import { AuthContext } from "./AuthContext";

function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    // Only wait for /me/ when there is a stored token to check.
    const [loading, setLoading] = useState(hasToken);

    useEffect(() => {
        if (hasToken()) {
            api("/me/")
                .then(setUser)
                .catch(() => clearTokens())
                .finally(() => setLoading(false));
        }

        const onLogout = () => setUser(null);
        window.addEventListener("auth:logout", onLogout);
        return () => window.removeEventListener("auth:logout", onLogout);
    }, []);

    const login = useCallback(async (username, password) => {
        const tokens = await api("/token/", {
            method: "POST",
            body: { username, password },
            auth: false,
        });
        setTokens(tokens);
        setUser(await api("/me/"));
    }, []);

    const register = useCallback(async (username, password) => {
        await api("/register/", {
            method: "POST",
            body: { username, password },
            auth: false,
        });
        await login(username, password);
    }, [login]);

    const logout = useCallback(() => {
        clearTokens();
        setUser(null);
    }, []);

    const value = useMemo(
        () => ({ user, loading, login, register, logout }),
        [user, loading, login, register, logout]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthProvider;
