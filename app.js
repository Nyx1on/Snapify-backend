import express from "express";
import * as dotenv from "dotenv";

dotenv.config();

const app = express();

const corsOptions = {
  origin: "http://localhost:3000",
  credentials: true,
};

const port = 8080;

app.post("/", (req, res) => {});

app.listen(
  port,
  console.log("Server listening on port: http://localhost:" + port + "/")
);
