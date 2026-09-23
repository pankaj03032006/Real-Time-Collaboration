

import "../instrument.mjs";

import * as Sentry from "@sentry/node";
import express from "express";
import cors from "cors";

import { ENV } from "./config/env.js";
import { connectDB } from "./config/db.js";
import { clerkMiddleware } from "@clerk/express";
import { functions, inngest } from "./config/inngest.js";
import { serve } from "inngest/express";
import chatRoutes from "./routes/chat.route.js";

Sentry.init({
  dsn: ENV.SENTRY_DSN,
  tracesSampleRate: 1.0,
  profilesSampleRate: 1.0,
  environment: ENV.NODE_ENV || "development",
  includeLocalVariables: true,
  sendDefaultPii: true,
});

const app = express();

app.use(express.json());

app.use(
  cors({
    origin: ENV.CLIENT_URL?.replace(/\/$/, ""),
    credentials: true,
  })
);

app.use(clerkMiddleware());

app.get("/debug-sentry", (req, res) => {
  throw new Error("My first Sentry error!");
});

app.get("/", (req, res) => {
  res.send("Hello World! 123");
});

app.use("/api/inngest", serve({ client: inngest, functions }));

app.use("/api/chat", chatRoutes);

Sentry.setupExpressErrorHandler(app);

const startServer = async () => {
  try {
    await connectDB();

    app.listen(ENV.PORT, "0.0.0.0", () => {
      console.log(`Server started on port: ${ENV.PORT}`);
    });

  } catch (error) {
    console.error("Error starting server:", error);
    process.exit(1);
  }
};

startServer();

export default app;
