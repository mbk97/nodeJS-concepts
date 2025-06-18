// ! 🔰 1. What is Redis

// * Redis (REmote DIctionary Server) is: An in-memory key-value store. Blazingly fast. Often used for caching, session storage, pub/sub, queues, etc.

// * Key properties: Stores data in RAM → very fast. Data types supported: Strings, Hashes, Lists, Sets, Sorted Sets, Bitmaps, HyperLogLogs, Streams.

// ! ⚡ 2. What is Caching

// * Caching is the process of storing frequently accessed data in a faster storage layer (like memory), so you don’t have to recompute or refetch it each time.

//  Example use cases:

//* Cache API responses

//* Cache DB queries

//* Cache HTML pages

//* Cache sessions and tokens

// ! 3. Installing Redis and Redis Client for Node.js

//* brew install redis

//* brew services start redis

// Testing

// * redis-cli ping  # should return PONG

// ! 🔹 Install Redis Client for Node.js

// * npm install ioredis

// redisClient.js
import Redis from "ioredis";
const redis = new Redis(); // default localhost:6379

export default redis;

// ! 🚀 4. Common Redis Commands (in Node.js)

await redis.set(
  "user:123",
  JSON.stringify({ name: "Mubarak", role: "admin" }),
  "EX",
  3600
);
const user = await redis.get("user:123");
console.log(JSON.parse(user)); // → { name: 'Mubarak', role: 'admin' }

// SET key value EX 3600 — store with 1-hour expiry

// GET key — fetch value

// DEL key — delete

// TTL key — time to live

// EXISTS key — check if it exists

// ! 🔁 5. Caching API Data — Example

app.get("/products/:id", async (req, res) => {
  const { id } = req.params;
  const cacheKey = `product:${id}`;

  const cached = await redis.get(cacheKey);
  if (cached) {
    return res.json(JSON.parse(cached));
  }

  const product = await Product.findById(id); // slow DB query
  await redis.set(cacheKey, JSON.stringify(product), "EX", 3600); // cache for 1 hour

  res.json(product);
});

// ! 🧰 6. Tools, Libraries & Patterns

//* ioredis — recommended client

//* express-redis-cache — for Express middleware caching

//* bullmq or bull — for Redis-based job queues

//* connect-redis — to store Express sessions in Redis

// ! 🔒 7. TTL and Invalidation

// You should: Set TTLs to prevent stale cache:

await redis.set("key", "value", "EX", 60); // expires in 60s

// Invalidate cache on update / delete:

await redis.del("product:123");

// ! 🛡️ 9. Common Caching Patterns
// Cache Aside (Lazy Loading) ✅
//* Check cache → if miss → get from DB → store in cache
//* Most common and flexible

// Write-Through
//* Write to both cache and DB together
//* Good consistency, but more writes

// Read-Through
//* Cache sits in front, auto-loads on miss (e.g. using a cache layer like memcached proxy)

// ! Real-World Example: Rate Limiting with Redis
const rateLimiter = async (req, res, next) => {
  const ip = req.ip;
  const key = `rate:${ip}`;
  const count = await redis.incr(key);

  if (count === 1) await redis.expire(key, 60); // 1 minute window

  if (count > 10) {
    return res.status(429).json({ error: "Too many requests" });
  }
  next();
};

// !  Redis Best Practices

//* Always set expiration (EX) for cached data

//* Use namespaced keys: e.g., user:123, blog:post:55

//* Cache only frequently accessed or slow-to-fetch data

//* Use Redis in asynchronous and non-blocking ways

//* Monitor Redis memory usage (INFO memory via CLI)

// ! REDIS SETUP EXAMPLE

// npm install express mongoose ioredis dotenv

const redisr = new Redis(process.env.REDIS_PORT || 6379);

redis.on("connect", () => {
  console.log("🔌 Connected to Redis");
});

redis.on("error", (err) => {
  console.error("❌ Redis Error:", err);
});

import express from "express";
import Product from "../models/Product.js";
import redis from "../redisClient.js";

const router = express.Router();

router.get("/:id", async (req, res) => {
  const { id } = req.params;
  const cacheKey = `product:${id}`;

  try {
    // 1. Check Redis
    const cached = await redis.get(cacheKey);
    if (cached) {
      return res.json({ source: "cache", data: JSON.parse(cached) });
    }

    // 2. Get from DB
    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: "Not found" });

    // 3. Save to Redis
    await redisr.set(cacheKey, JSON.stringify(product), "EX", 3600); // 1hr TTL

    res.json({ source: "db", data: product });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start Redis: redis-server

// ! 📌 What to Cache in a News CMS

// * Home Page News Feed : why: Most-read page, lots of DB queries. Cache for fast delivery.

// * Individual News Articles: why: Articles don't change often. Cache by slug or id.

// * Category Pages (e.g. /sports, /tech): why: Frequently visited and usually slow to query.

// * User Sessions: why: Fast login/session lookup.

// ⏳ When to Cache

// 🟢 Cache When:

//* Content is read-heavy, not write-heavy (e.g., articles).

//* Data is expensive to query or compute (e.g., Article.find().sort({ trendingScore: -1 })).

//* Pages with high traffic (homepage, categories, featured).

// 🔴 Don’t Cache When:

//* Content is frequently updated and needs to be real-time (e.g., live scores).

//* Data is user-specific and sensitive (e.g., user drafts, private dashboards).

//* During write operations (like form submissions, CMS updates) — instead, invalidate cache after writes.

// ! Using Upstash Redis
//  npm install express dotenv @upstash/redis

// env

// UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
// UPSTASH_REDIS_REST_TOKEN=your-upstash-token

// index.js

require("dotenv").config();
const express = require("express");
const { Redis } = require("@upstash/redis");

const app = express();
const PORT = 3000;

// Upstash Redis client
const redis2 = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

// Fake DB call
const getFakeNewsFromDb = async () => {
  return [
    { id: 1, title: "News 1", content: "Lorem ipsum" },
    { id: 2, title: "News 2", content: "Dolor sit amet" },
  ];
};

// GET /news endpoint with caching
app.get("/news", async (req, res) => {
  try {
    const cacheKey = "news:all";
    const cachedNews = await redis.get(cacheKey);

    if (cachedNews) {
      return res.status(200).json({
        success: true,
        source: "cache",
        data: cachedNews,
      });
    }

    const news = await getFakeNewsFromDb();

    // Cache it for 10 minutes (600 seconds)
    await redis2.set(cacheKey, news, { ex: 600 });

    res.status(200).json({
      success: true,
      source: "db",
      data: news,
    });
  } catch (error) {
    console.error("Error fetching news:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

// * How does redis work on my app deployed to vercel

// 🧠 First, Understand This:

// Vercel is serverless, meaning:

// Each API request spins up a new serverless function instance.

// Serverless functions can’t maintain persistent TCP connections, which Redis normally uses.

// ⚠️ Problem with Redis on Vercel

// Redis (like MongoDB, PostgreSQL) relies on persistent socket connections, but:

// Vercel doesn't allow long-lived connections from serverless functions.

// Every new request opens a new Redis connection, which is slow and inefficient.

// You can quickly hit connection limits on your Redis instance (e.g., 30–50 max).

// ✅ Solution: Use a Remote Redis Service + HTTP Layer or Edge Functions

// 🚫 What NOT to Do

// Don’t use standard Redis clients like ioredis or node-redis directly in Vercel API routes.

// Don’t assume you can keep a connection alive between API calls on Vercel — it won’t work consistently.
