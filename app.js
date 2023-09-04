import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./database/connect.js";
import User from "./database/models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";

dotenv.config();

const app = express();

const corsOptions = {
  origin: "http://localhost:3000",
  credentials: true,
};

app.use(express.json());
app.use(cors(corsOptions));
app.use(cookieParser());

const port = process.env.PORT || 8000;

var salt = bcrypt.genSaltSync(10);
const jwtSecret = process.env.ACCESS_TOKEN;

app.get("/test", (req, res) => {
  res.json("test ok");
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({
      email: email,
    });
    if (user) {
      const checkPass = bcrypt.compareSync(password, user.password);
      if (checkPass) {
        jwt.sign(
          {
            email: user.email,
            id: user._id,
          },
          jwtSecret,
          {},
          (err, token) => {
            if (err) throw err;
            console.log("Successfully logged in");
            res.cookie("token", token).json(user);
          }
        );
      } else {
        console.log("Password is incorrect");
        res.status(422).json("password not matched");
      }
    } else {
      console.log("User not found");
    }
  } catch (err) {
    res.status(404);
  }
});

app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const newUser = await User.create({
      name: name,
      email: email,
      password: bcrypt.hashSync(password, salt),
      type: "User",
    });
    res.json(newUser);
  } catch (e) {
    res.status(422).json({ message: "Error creating user" });
  }
});

app.post("/create-admin", async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const newUser = await User.create({
      name: name,
      email: email,
      password: bcrypt.hashSync(password, salt),
      type: "Admin",
    });
    console.log("Admin created", newUser);
    res.json(newUser);
  } catch (e) {
    res.status(422).json({ message: "Error creating user" });
  }
});

app.get("/profile", async (req, res) => {
  const cookies = req.cookies;
  const token = cookies.token;
  if (token) {
    jwt.verify(token, jwtSecret, {}, async (err, userData) => {
      if (err) throw err;
      const { name, email, id } = await User.findById(userData.id);
      res.json({ name, email, id });
    });
  }
});

app.get("/logout", (req, res) => {
  console.log("Successfully logged out");
  res.cookie("token", "").json(true);
});

const startServer = async () => {
  try {
    connectDB(process.env.MONGODB_URL);
  } catch (error) {
    console.error("Error connecting to MongoDb");
  }
  app.listen(8000, () => {
    console.log(`Server listening on port: http://localhost:${port}/`);
  });
};

startServer();
