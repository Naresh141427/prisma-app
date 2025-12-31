import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  log: ["query", "info", "warn", "error"], // This makes the options "non-empty"
});

export default prisma;
