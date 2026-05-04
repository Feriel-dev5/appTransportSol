require("dotenv").config({ quiet: true });
const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const routes = require("./src/Routes");
const {
  errorHandler,
  notFoundHandler,
} = require("./src/middlewares/errorHandler");
const { connectDb } = require("./src/Config/db");

const port = process.env.PORT || 5000;

const app = express();

app.use(express.json());
// const local = process.env.VITE_ORIGIN_LOCAL;
// const remote = process.env.VITE_ORIGIN_REMOTE;
//
// const localTest = process.env.VITE_ORIGIN_LOCALT;
//
// const remoteT = process.env.VITE_ORIGIN_REMOTET;
// const origins = [local, remote, localTest, remoteT]
//   .map((origin) => origin?.trim())
//   .filter(Boolean);

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

app.use("/api", routes);

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
