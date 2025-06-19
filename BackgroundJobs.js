// ! Background Jobs

// * Background jobs in Node.js are tasks that run outside the main request-response cycle. These are especially useful for time-consuming or repetitive operations like sending emails, generating reports, or retrying failed tasks

// 🔧 Tools for Background Jobs in Node.js

//* The most common tools are:

//* BullMQ / Bull – Redis-based job queue

//* Agenda – MongoDB-based job scheduler

//* node-cron – Simple cron job scheduler

//* Bree – Job scheduler with worker threads

// ! 🧠 Use Cases for Background Jobs

// | Use Case                    | Description                                                |
// | --------------------------- | ---------------------------------------------------------- |
// | 📧 Email Sending            | Send welcome emails after registration                     |
// | 📊 Report Generation        | Generate daily sales reports                               |
// | 🛒 Abandoned Cart Reminders | Schedule reminders for users who didn’t complete purchases |
// | 🔄 Retry Failed Tasks       | Retry failed webhook deliveries or API calls               |
// | 📥 Data Sync                | Sync data between services periodically                    |
// | 🎯 Notification Scheduling  | Push or email notifications for upcoming events            |

// ! 🟥 1. Bull / BullMQ – Redis-based job queue
// * Bull is a popular job queue for Node.js that uses Redis as its backend

// 📌 Best For:

//* Queuing background jobs (email sending, video processing, etc.)

//* Prioritizing, retrying, and delaying jobs

//* Distributed systems with Redis

// ✅ Why It's Great:

//* Built-in retries, job events, rate-limiting, and concurrency control

//* Uses Redis for fast performance and persistence

//* Works well with microservices

// setup
const Queue = require("bull");
const sendEmailQueue = new Queue("send-email", "redis://127.0.0.1:6379");

// Producer
sendEmailQueue.add({ email: "user@example.com" });

// Consumer (Processor)
sendEmailQueue.process(async (job) => {
  console.log(`Sending email to ${job.data.email}`);
  // call your mail function here
});

// 🧠 Use Bull if you’re doing heavy asynchronous jobs that need retries, delays, or status tracking.

//! 🟦 2. Agenda – MongoDB-based job scheduler

// 📌 Best For:
// * Applications already using MongoDB

// * Delayed jobs and recurring tasks

// * Jobs stored in MongoDB for inspection/retries

// ✅ Why It's Great:

//* Cron-style syntax

//* Persistence via MongoDB

//* Supports job priority, concurrency, locking

// 🔧 Setup:
const { Agenda } = require("agenda");
const agenda = new Agenda({ db: { address: "mongodb://localhost/agendaDb" } });

agenda.define("send report", async (job) => {
  console.log("Sending daily report...");
});

(async function () {
  await agenda.start();
  await agenda.every("0 8 * * *", "send report"); // every day at 8am
})();

//! 🟨 3. node-cron – Lightweight cron job scheduler

// 📌 Best For:
//* Simple scheduled tasks (e.g., clean-up, pings)

//* Apps without Redis/MongoDB

// ✅ Why It's Great:

//* Simple and lightweight

//* Cron syntax-based

//* No external dependencies

// 🔧 Setup:

const cron = require("node-cron");

cron.schedule("* * * * *", () => {
  console.log("Running a job every minute", new Date());
});

//! 🟩 4. Bree – Job scheduler with worker threads

// 📌 Best For:
//* Jobs that require full CPU usage or long-running tasks

//* Multi-threaded jobs using Node.js worker threads

// ✅ Why It's Great:

//* Worker thread support for CPU-bound jobs

//* TypeScript support

//* Human-friendly recurring syntax

// setup

const Bree = require("bree");
const path = require("path");

const bree = new Bree({
  jobs: [
    {
      name: "log-time",
      path: path.join(__dirname, "jobs/log-time.js"),
      interval: "5s",
    },
  ],
});

bree.start();
