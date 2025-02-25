// src/App.js
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "./firebase"; // Ruta correcta a firebase.js
import Signup from "./components/Signup"; // Ruta correcta a Signup.js
import Login from "./components/Login"; // Ruta correcta a Login.js

// Componente Ruta Privada
const PrivateRoute = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [token, setToken] = useState(null);

    const auth = getAuth();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setIsLoggedIn(true);
                user.getIdToken().then((idToken) => {
                    setToken(idToken); // Guarda el token en el estado
                });
            } else {
                setIsLoggedIn(false);
                setToken(null); // Elimina el token si el usuario no está autenticado
            }
        });

        return () => unsubscribe();
    }, [auth]);

    if (!isLoggedIn) {
        return <div>Please log in to access this page.</div>;
    }

    return (
        <div>
            <div>
                <h3>Authenticated!</h3>
                <p>Your token: {token}</p>
            </div>
            {children}
        </div>
    );
};

function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setIsLoggedIn(true);
            } else {
                setIsLoggedIn(false);
            }
        });

        return () => unsubscribe();
    }, []);

    const handleLogout = async () => {
        try {
            await signOut(auth);
            alert("Logged out successfully!");
        } catch (err) {
            console.error("Error signing out: ", err.message);
        }
    };

    return (
        <Router>
            <div className="App">
                <nav>
                    <ul>
                        <li>
                            <Link to="/">Home</Link>
                        </li>
                        {!isLoggedIn ? (
                            <>
                                <li>
                                    <Link to="/signup">Sign Up</Link>
                                </li>
                                <li>
                                    <Link to="/login">Login</Link>
                                </li>
                            </>
                        ) : (
                            <li>
                                <button onClick={handleLogout}>Logout</button>
                            </li>
                        )}
                        <li>
                            <Link to="/private">Private Page</Link>
                        </li>
                    </ul>
                </nav>

                <Routes>
                    <Route path="/" element={<h2>Welcome to the app!</h2>} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/login" element={<Login />} />
                    <Route
                        path="/private"
                        element={
                            <PrivateRoute>
                                <h2>This is a private page. Only logged in users can see this.</h2>
                            </PrivateRoute>
                        }
                    />
                </Routes>
            </div>
        </Router>
    );
}

export default App;

