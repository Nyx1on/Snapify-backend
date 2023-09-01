import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./database/connect.js";
import User from "./database/models/User.js";
import bcrypt from "bcryptjs";

dotenv.config();

const app = express();

const corsOptions = {
  origin: "http://localhost:3000",
  credentials: true,
};

app.use(express.json());
app.use(cors(corsOptions));

const port = process.env.PORT || 8000;

var salt = bcrypt.genSaltSync(10);

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
        res.json("password ok");
      } else {
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
    });
    res.json(newUser);
  } catch (e) {
    res.status(422).json({ message: "Error creating user" });
  }
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
