import Redis from "ioredis";
import { env } from "../config/env";
import logger from "./logger";

const redis = new Redis({
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  maxRetriesPerRequest: null,
});

redis.on("connect", () => {
  logger.info("Redis Connected Successfully");
});

redis.on("error", (err) => {
  logger.error(err, "Redis connection error: ");
});

export default redis;
