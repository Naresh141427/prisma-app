import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  log: ["error", "warn"], // This makes the options "non-empty"
});

export default prisma;
