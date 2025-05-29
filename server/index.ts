import 'dotenv/config';
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      
      // Add response summary without sensitive data
      if (capturedJsonResponse) {
        // Create a sanitized copy of the response
        const sanitizedResponse = { ...capturedJsonResponse };
        
        // Redact sensitive fields
        if (sanitizedResponse.password) sanitizedResponse.password = '[REDACTED]';
        if (sanitizedResponse.id && path.includes('/user')) {
          // Just indicate this is a user object without details
          logLine += ` :: { type: 'user', id: ${sanitizedResponse.id} }`;
        } else if (res.statusCode >= 400) {
          // For errors, just log the error message
          logLine += ` :: ${JSON.stringify({ message: sanitizedResponse.message || 'Error' })}`;
        } else if (Array.isArray(sanitizedResponse)) {
          // For arrays, just log the count
          logLine += ` :: Array[${sanitizedResponse.length}]`;
        } else {
          // For other responses, log that a response was sent but don't include details
          logLine += ` :: [Response sent]`;
        }
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Test database connection
  const { testDatabaseConnection } = await import('./db');
  await testDatabaseConnection();
  
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
