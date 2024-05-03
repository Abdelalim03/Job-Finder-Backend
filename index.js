const express = require("express");
require("dotenv").config();
const app = express();
const cors = require("cors");
const { UPLOAD_PATH, PORT } = require("./src/configs");
const morgan = require("morgan");
const prisma = require("./src/models/prismaClient.js");
const path = require("path");
const authRouter = require("./src/routes/auth.route.js");
const categoriesRouter = require("./src/routes/categories.route.js");

// const uploadsPath = path.join(__dirname, UPLOAD_PATH);
// app.use('/uploads', express.static(uploadsPath));

//global middlewares
app.use(cors());
app.use(
  morgan("dev", {
    skip: (req, _) => req.path === "/health",
  })
);
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);

app.get("/", async (req, res) => {
  const addresses = await prisma.address.findMany({});

  console.log(addresses);
  return res.send("Welcome to jobFinder API");
});

app.use("/api/auth", authRouter);
app.use("/api/categories",categoriesRouter)
//health check route (used by docker compose)
app.get("/health", (req, res) => res.send("OK"));

//routes
// app.use('/api/auth', authRouter);

//global error handler
app.use(async (err, req, res, next) => {
  if (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//don't start server when testing
if (process.env.NODE_ENV !== "test") {
  const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server listening at http://localhost:${PORT}`);
  });
}

module.exports = app;
