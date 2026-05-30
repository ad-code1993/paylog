import dotenv from "dotenv";
// Load env vars first
dotenv.config();

import express from "express";
import cors from "cors";
import router from "./routes";
import { errorHandler } from "./middlewares/error.middleware";

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routing
app.use("/api", router);

// Error Handling
app.use(errorHandler);

export default app;
