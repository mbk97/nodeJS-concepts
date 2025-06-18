// !  🛡️ 1. Helmet

//* Helmet helps secure your Express apps by setting various HTTP headers.

// ** Helmet helps secure your Express apps by setting HTTP headers. It’s like putting a lock, camera, and alarm system on your server's doors and windows.

// ** It helps protect against common vulnerabilities like clickjacking, MIME sniffing, and more by setting appropriate HTTP headers.

// ** By default, browsers have security features based on headers. Helmet makes sure those headers are set properly to prevent things like:

//* - Clickjacking: Prevents your site from being embedded in an iframe on another site.

//* - MIME Sniffing: Prevents browsers from interpreting files as something else than what they are.

//* - Content Security Policy (CSP): Helps prevent XSS attacks by controlling which resources can be loaded.

const helmet = require("helmet");
app.use(helmet());

// ! 🌍 2. CORS (Cross-Origin Resource Sharing) — "Border patrol"

//* CORS lets your server say who is allowed to talk to it from another domain (e.g. a frontend hosted at myfrontend.com accessing myapi.com).

//* Without it, the browser will block those cross-origin requests for safety.

// Why use it:

//* Allow or restrict frontend apps from different domains.

//* Enable secure API access.

const cors = require("cors");
app.use(cors());

app.use(
  cors({
    origin: "https://myfrontend.com", // allow only this domain
    methods: ["GET", "POST"],
    credentials: true,
  })
);

// ! ⏱️ 3. Rate Limiting — "Traffic cop - "Bouncer limiting how many times you knock on the door"

// * Prevents abuse by limiting the number of requests an IP can make in a certain period (like login attempts or API spam).

//* Rate limiting controls how many requests a user can make in a certain time period.

//* It helps prevent abuse, like brute force attacks or DDoS attacks, by limiting the number of requests from a single IP address.

const rateLimit = require("express-rate-limit");

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Max 100 requests per IP in 15 mins
  message: "Too many requests, try again later.",
});

app.use(limiter);

app.post("/login", limiter, loginHandler);

//! You're telling Express: Before any request hits my routes, pass it through the limiter function.”

//! express-rate-limit is a middleware.

//* In Express, middleware functions are functions that have access to the req, res, and next objects, and they sit in the request-response cycle. They can modify the request, the response, or stop the request entirely.
