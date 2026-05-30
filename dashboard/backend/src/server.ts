import app from "./app";
import prisma from "./config/prisma";

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(`  Digital Credit Tracking System MVP  `);
  console.log(`  Server is running on port ${PORT}      `);
  console.log(`  Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`=========================================`);
});

// Handle clean shutdown
const shutdown = async () => {
  console.log("Shutting down server...");
  server.close(async () => {
    console.log("Express server closed.");
    await prisma.$disconnect();
    console.log("Database connection closed.");
    process.exit(0);
  });
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
