import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./database/connect.js";
import User from "./database/models/User.js";
import Album from "./database/models/Album.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import multer from "multer";
import fs from "fs";

dotenv.config();

const app = express();

const corsOptions = {
  origin: "http://localhost:3000",
  credentials: true,
};

app.use(express.json());
app.use("/uploads", express.static("uploads"));
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

const imagesMiddleware = multer({ dest: "uploads/" });

app.post(
  "/images/upload",
  imagesMiddleware.array("photos", 100),
  (req, res) => {
    const uploadedFiles = [];
    for (let i = 0; i < req.files.length; i++) {
      const { path, originalname } = req.files[i];
      const parts = originalname.split(".");
      const ext = parts[parts.length - 1];
      const newPath = path + "." + ext;
      fs.renameSync(path, newPath);
      uploadedFiles.push(newPath.replace("uploads\\", ""));
    }
    res.json(uploadedFiles);
  }
);

app.post("/album/create", (req, res) => {
  const { token } = req.cookies;
  const data = req.body.data;
  const images = req.body.images;

  data.images = images;

  if (token) {
    jwt.verify(token, jwtSecret, {}, async (err, userData) => {
      if (err) throw err;
      const albumDoc = await Album.create({
        createdBy: userData.id,
        ...data,
      });
      res.json(albumDoc);
    });
  }
});

app.get("/albums/list/get", (req, res) => {
  const { token } = req.cookies;
  if (token) {
    jwt.verify(token, jwtSecret, {}, async (err, userData) => {
      if (err) throw err;
      const albumsList = await Album.find({ createdBy: userData.id });
      res.json(albumsList);
    });
  }
});

app.get("/album/get/:id", (req, res) => {
  const { id } = req.params;
  try {
    const { token } = req.cookies;
    if (token) {
      jwt.verify(token, jwtSecret, {}, async (err, userData) => {
        if (err) throw err;
        const albumDoc = await Album.findOne({ _id: id });
        res.json(albumDoc);
      });
    }
  } catch (e) {
    res.status(404);
  }
});

app.get("/albums/all/get", async (req, res) => {
  try {
    const allAlbums = await Album.find();
    console.log(allAlbums);
    res.json(allAlbums);
  } catch (err) {
    res.status(404);
  }
});

app.get("/image2prompt/get", (req, res) => {});

const startServer = async () => {
  try {
    connectDB(process.env.MONGODB_URL);
  } catch (error) {
    console.error("Error connecting to MongoDb");
  }
  app.listen(port, () => {
    console.log(`Server listening on port: http://localhost:${port}/`);
  });
};

startServer();
