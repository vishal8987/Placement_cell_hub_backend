const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { default: mongoose } = require("mongoose");  // you have this line

// Add this line right after requiring mongoose
mongoose.set('strictQuery', false);  // or true if you want current behavior

const adminRoute = require("./routes/adminroute");
const certificateRoute = require("./routes/certificateroute");
const eventRoute = require("./routes/eventroute");
const Placements = require("./routes/placementsRoute");
const JAF = require("./routes/jaf");
const News = require("./routes/newsRoute");
const userRoute=require("./routes/userRoute");
// create express app
const app = express();

// config environment variable files to use the variables
dotenv.config();
console.log("Mongo URI:", process.env.MONGOURI);

app.use(cors({
  origin: "http://localhost:3000",  // Your frontend URL
  credentials: true,                 // If your frontend sends cookies/auth headers (optional)
}));

mongoose.connect(process.env.MONGOURI, (err) => {
  if (err) console.log(err);
  else console.log("Connected to MongoDB");
});

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "Welcome to homepage"
  });
});

// routes for the endpoints
app.use("/admin/signin/", adminRoute);
app.use("/admin/cert/", certificateRoute);
app.use("/admin/events/", eventRoute);
app.use("/admin/placements/", Placements);
app.use("/sendFile", JAF);
app.use("/newsUpdates", News);
app.use("/api/user",userRoute);
const PORT = process.env.PORT || 3010;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`,`http://localhost:${PORT}`);
});
