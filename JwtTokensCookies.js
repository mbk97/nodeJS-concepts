// !  JWT, refresh tokens, cookies vs tokens

// ! 🔐 What is JWT (JSON Web Token)

// * A JSON Web Token (JWT) is an open standard for securely transmitting information between parties as a JSON object. It's often used for authentication and authorization in web applications, acting as a digital "passport" that verifies a user's identity and permissions.

// * Imagine a JWT as a digital ID card you carry after logging into a website. It proves who you are.

// * When you log in, the server gives you a token (like a signed ID card).

// * You show that token every time you make a request to a protected route.

// * The server checks the signature on the token instead of looking you up in a database every time.

// ! 🔁 What is a Refresh Token?

// * Think of a refresh token like the key to get a new ID card when your current one expires.

//*  JWTs are short-lived (e.g., 15 mins) for security.

//*  A refresh token is longer-lived (e.g., 7 days) and stored securely.

//*  When your JWT expires, you send the refresh token to get a new JWT without logging in again.

// ! 🍪 What are Cookies?

// * Cookies are small pieces of data stored on the user's browser by the server. Think of a cookie like a note the server gives the browser and says, "Keep this and bring it with you next time."

// Purpose:

//* Remember users between sessions

//* Store authentication tokens (like refresh tokens)

//* Save preferences (like dark mode)

//* Track sessions (e.g., items in a shopping cart)

// ⚠️ Security Tips

//* Always set HttpOnly for auth cookies

//* Use Secure in production (HTTPS only)

//* Prefer SameSite=Strict to prevent CSRF

//* Avoid storing sensitive data directly in cookies (store tokens instead)

// 🍪 Automatic Behavior in the Browser
//* When the backend sets a cookie using res.cookie() in Node.js, the browser automatically stores it, and then automatically sends it back with every request to the same domain.

// ✅ Example:

//* You hit /login, the server sends a Set-Cookie header.

//* The browser saves it.

//* On every future request to that domain, the cookie is sent in the request headers:

// ! NODE JS SETUP

// npm install express jsonwebtoken cookie-parser cors

// server.js
const express = require("express");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

const JWT_SECRET = "your_secret_key";

app.post("/login", (req, res) => {
  const { email, password } = req.body;

  // Dummy auth
  if (email === "test@example.com" && password === "password") {
    const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: "1h" });

    res.cookie("token", token, {
      httpOnly: true,
      secure: false, // set to true in production with HTTPS
      sameSite: "Lax",
      maxAge: 3600000,
    });

    res.json({ message: "Logged in successfully" });
  } else {
    res.status(401).json({ message: "Invalid credentials" });
  }
});

app.get("/profile", (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: "No token" });

  try {
    const data = jwt.verify(token, JWT_SECRET);
    res.json({ email: data.email });
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out" });
});

app.listen(5000, () => console.log("Server running on http://localhost:5000"));

// ! Protected Route in NODE JS
const jwt = require("jsonwebtoken");
const User = require("../model/userModel"); // Adjust the path as needed

const authenticateUser = async (req, res, next) => {
  try {
    const token = req.cookies?.token;

    if (!token || token.trim() === "") {
      return res
        .status(401)
        .json({ message: "Unauthorized. No token provided." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ message: "Unauthorized. User not found." });
    }

    req.user = {
      id: user.id || user._id?.toString(),
      role: user.roleName,
      ...user.toObject?.(),
    };

    next();
  } catch (err) {
    console.error("Authentication error:", err);
    return res.status(401).json({ message: "Invalid or expired token." });
  }
};

export { authenticateUser };

// ! ⚛️ Frontend (React)
// LoginForm.jsx
import { useState } from "react";
import axios from "axios";

axios.defaults.withCredentials = true;

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [profile, setProfile] = useState(null);

  const handleLogin = async () => {
    try {
      await axios.post("http://localhost:5000/login", { email, password });
      alert("Logged in!");
    } catch (err) {
      alert("Login failed");
    }
  };

  const fetchProfile = async () => {
    try {
      const res = await axios.get("http://localhost:5000/profile");
      setProfile(res.data);
    } catch {
      alert("Not authenticated");
    }
  };

  const handleLogout = async () => {
    await axios.post("http://localhost:5000/logout");
    setProfile(null);
  };

  return (
    <div>
      <h2>Login</h2>
      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      <input
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        type="password"
      />
      <button onClick={handleLogin}>Login</button>

      <h2>Actions</h2>
      <button onClick={fetchProfile}>Fetch Profile</button>
      <button onClick={handleLogout}>Logout</button>

      {profile && <pre>{JSON.stringify(profile, null, 2)}</pre>}
    </div>
  );
}

// ✅ Notes:

//* The token is automatically included in requests via cookies (when using withCredentials and HttpOnly).

//* It is secure from XSS because it's not accessible via JavaScript.

//* For production: enable secure: true and use HTTPS.

// ! ✅ When using HttpOnly cookies, you do not need to manually send the token to the frontend or attach it to headers like Authorization. The browser handles this automatically, sending the cookie with each request to the same domain.
// ! This setup provides a secure way to manage authentication without exposing sensitive tokens to client-side scripts.
// ! Remember to always use HTTPS in production to protect cookies and tokens from being intercepted.

//! 🔁 Refactored Version Using Cookies
import axios, { AxiosInstance } from "axios";

const redirectToLogin = () => {
  localStorage.clear(); // Still good if you store other data
  window.location.href = "/login";
};

const createApiClient = () => {
  const baseURL = import.meta.env.VITE_API_URL;

  const client = axios.create({
    baseURL,
    withCredentials: true, // 👈 VERY IMPORTANT: allow cookies to be sent
    headers: {
      "Content-Type": "application/json",
    },
  });

  // 🔥 REMOVE manual token attachment, since cookies will handle auth
  // Optional: You can still add other headers here if needed

  // Handle unauthorized responses globally
  client.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        redirectToLogin();
      }
      return Promise.reject(error);
    }
  );

  return client;
};

const apiClient = createApiClient();
export { apiClient };

// ! Auth based context

import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

axios.defaults.withCredentials = true;

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const res = await axios.get("http://localhost:5000/me");
      setUser(res.data.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

// ! ✅ Rewritten ProtectedRoute for Cookie-Based Auth
import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext"; // assumes you created this

const ProtectedRoute = ({ allowedRoles = [], redirectTo = "/login" }) => {
  const { user, loading } = useAuth(); // 👈 coming from AuthContext

  if (loading) return <div>Loading...</div>;

  const isAuthenticated = !!user;
  const userRole = user?.role;

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

export { ProtectedRoute };

// ! Cookies Vs Token

//* Cookies are small pieces of data stored by the browser and automatically sent with every HTTP request, while tokens (like JWTs) are manually added to HTTP headers by the client.

//* Cookies can be marked as HttpOnly, making them more secure against JavaScript-based attacks like XSS, but tokens stored in localStorage or sessionStorage are accessible to JavaScript and more vulnerable to such attacks.

//* Cookies are automatically handled by the browser, making them easy to use with server frameworks, while tokens give developers more control but require manual setup and handling.

//* Cookies are best suited for traditional web apps that rely on server-rendered pages, while tokens are ideal for APIs and single-page applications (SPAs) like those built with React or Angular.

//* Tokens are immune to CSRF (Cross-Site Request Forgery) because they are not automatically sent with requests, but cookies can be vulnerable to CSRF if not properly configured.

//* Tokens allow for stateless authentication, meaning the server doesn’t need to store session data, whereas cookies typically rely on sessions that are tracked and stored on the server.
