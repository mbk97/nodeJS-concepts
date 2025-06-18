// ! 🔐 1. Cross-Site Request Forgery (CSRF)
// * CSRF tricks a logged-in user into submitting a request they didn’t intend (e.g. transferring funds).

// ✅ Prevention:

//* Use CSRF tokens that are tied to sessions.
//* Use csurf middleware in Express

//! You should consider implementing CSRF protection (with CSRF tokens) in any application where:

// ! 🧨 1. Your app uses cookies for authentication

//* CSRF is only a risk when cookies are used, because browsers automatically send cookies with every request—even from malicious third-party sites.

// ! ❌ 2. CSRF protection is NOT needed if

//**  You're using only tokens (like JWT) in headers for authentication

//**  You're not using cookies at all to store tokens/session identifiers

//**  In this case, the attacker cannot forcefully send an Authorization header from another origin, so CSRF is not a concern.

// ! Implementation Example

// * NODE JS

import express from "express";
import cookieParser from "cookie-parser";
import csrf from "csurf";

const app = express();
const port = 3000;

// Middleware
app.use(cookieParser());
app.use(express.json());

// Enable CSRF protection via cookies
const csrfProtection = csrf({ cookie: true });
app.use(csrfProtection);

// Route to get CSRF token
app.get("/csrf-token", (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

// Example protected POST route
app.post("/submit", (req, res) => {
  res.json({ message: "Form submission successful!" });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

// * REACT JS

useEffect(() => {
  fetch("/csrf-token", { credentials: "include" })
    .then((res) => res.json())
    .then((data) => setCsrfToken(data.csrfToken));
}, []);

const handleSubmit = async () => {
  await fetch("/submit", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "CSRF-Token": csrfToken,
    },
    credentials: "include",
    body: JSON.stringify({ something: "value" }),
  });
};

//! 🛡️ 2. Cross-Site Scripting (XSS)

// * XSS occurs when malicious scripts are injected into web pages viewed by other users.

//! ✅ Prevention:

//* Escape output in HTML, JavaScript, or attributes using libraries like xss, DOMPurify, or template engines with built-in escaping.

//* Use Content Security Policy (CSP) headers.

//* Sanitize inputs using libraries like xss or sanitize-html.
