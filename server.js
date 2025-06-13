const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const https = require("https");
const helmet = require("helmet");

dotenv.config();

const Placements = require("./routes/placementsRoute");
const eventRoute = require("./routes/eventroute");
const JAF = require("./routes/jaf");
const News = require("./routes/newsRoute");
const Teams = require("./routes/teamRoute");
const userRoute = require("./routes/userRoute");

const app = express();
const port = process.env.PORT || 5000;

// Cloudinary config
const cloudinary = require("cloudinary").v2;
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Mongoose settings
mongoose.set('strictQuery', false);

if (!process.env.MONGOURI) {
  console.error("Error: MONGOURI is not defined in .env");
  process.exit(1);
}

mongoose
  .connect(process.env.MONGOURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to MongoDB Placements"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Middleware
app.use(helmet()); // or app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// Routes
app.use("http://localhost:3000/signup", userRoute);
app.use("/admin/placements", Placements);
app.use("/admin/events", eventRoute);
app.use("/sendFile", JAF);
app.use("/newsUpdates", News);
app.use("/teamform", Teams);

app.get("/", (req, res) => {
  res.json({ message: "Welcome to the API homepage" });
});

// Error handler middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

// Self-ping to prevent sleeping
const SELF_PING_URL = process.env.SELF_PING_URL || `http://localhost:${port}`;
setInterval(() => {
  https
    .get(SELF_PING_URL, (res) => {
      console.log(`Pinged server - Status Code: ${res.statusCode}`);
    })
    .on("error", (err) => {
      console.error(`Error pinging server: ${err.message}`);
    });
}, 5 * 60 * 1000);

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port} http://localhost:${port}`);
});
