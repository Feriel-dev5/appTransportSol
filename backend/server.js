require("dotenv").config({ quiet: true });
const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");

const {
  errorHandler,
  notFoundHandler,
} = require("./src/middlewares/errorHandler");
const { connectDb } = require("./src/Config/db");

const port = process.env.PORT || 5000;

const app = express();

app.use(express.json());

app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);

app.use(
  rateLimit({
    windowMs: 60 * 1000,
    max: 120,
  }),
);

app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "Awake" });
});

app.use(notFoundHandler);
app.use(errorHandler);

const start = async () => {
  try {
    await connectDb();
    app.listen(port, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${port}`);
    });
  } catch (error) {
    console.error("Error starting the server", error);
    process.exit(1);
  }
};

start();
