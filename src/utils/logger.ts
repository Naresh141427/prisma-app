import pino from "pino";
import dayjs from "dayjs"; // Optional: for nice timestamps (npm i dayjs)

const logger = pino({
  // Level: 'info' means we log everything from info, warn, and error.
  // In 'debug' mode, we might want more details.
  level: process.env.LOG_LEVEL || "info",

  transport: {
    target: "pino-pretty",
    options: {
      colorize: true, // Colors in terminal
      translateTime: "SYS:standard", // Readable timestamp
      ignore: "pid,hostname", // Clean up the log output
    },
  },
  base: {
    pid: false, // Don't log Process ID in output (cleaner)
  },
  timestamp: () => `,"time":"${dayjs().format()}"`,
});

export default logger;
