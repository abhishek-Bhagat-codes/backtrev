import { createContext, useContext, useState } from "react";
import { useEffect } from "react";
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem("token"));
    const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")) || null);
    const authorizationToken = `Bearer ${token}`;

    //Store token in local storage
    const storeTokenInLS = (serverToken) => {
        setToken(serverToken);
        localStorage.setItem("token", serverToken);
    };
    //Store user data in local storage
    const storeUserInLS = (serverUser) => {
        setUser(serverUser);
        localStorage.setItem("user", JSON.stringify(serverUser));
    };

    let isLoggedIn = !!token; //if token is present then true else false
    console.log("isLoggedIn : ", isLoggedIn);

    //Tackling the Logout functionality
    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setToken(null);
        setUser(null);
    };

    //JWT Authentication - to get the currently loggedIn user data
    const userAuthentication = async () => {
        try {
            if (!token) return;

            const response = await fetch(`/api/users/me`, {
                method: "GET",
                headers: {
                    Authorization: authorizationToken,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setUser(data.user || data.userData || data);
                console.log("Authenticated user data : ", data.user || data.userData || data);
            } else {
                console.error("Failed to fetch user data");
                logout();
            }
        } catch (error) {
            console.error("Error in fetching user data : ", error);
        }
    }

    useEffect(() => {
        userAuthentication();
    }, [token])

    return (
        <AuthContext.Provider value={{ isLoggedIn, storeTokenInLS, storeUserInLS, user, authorizationToken, logout}                                                                                                                                                                                                                                                                                                                 }>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const authContextValue = useContext(AuthContext);
    
    if(!authContextValue){
        throw new Error(" useAuth used outside of the Provider");
    }

    return authContextValue;
};

