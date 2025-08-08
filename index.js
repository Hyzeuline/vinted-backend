require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const cloudinary = require("cloudinary").v2;

const app = express();
app.use(cors());
app.use(express.json());

// mongoose.connect("mongodb://localhost:27017/vinted");
mongoose.connect(process.env.MONGODB_URI);

cloudinary.config({
  //je connecte mon drive à mon fichier
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET_KEY,
});

const User = require("./models/User");

const userRoutes = require("./routes/userRoutes");
app.use(userRoutes);

const offerRoutes = require("./routes/offerRoutes");
app.use(offerRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Bienvenue sur Vinted !" });
});

app.all(/.*/, (req, res) => {
  return res.status(404).json("Not found");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server has started on port : ${PORT}`);
});
