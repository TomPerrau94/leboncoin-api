const express = require("express");
const formidable = require("express-formidable");
const mongoose = require("mongoose");
require("dotenv").config();
const cors = require("cors");
app.use(cors());

const app = express();
app.use(formidable());
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
});

// Import des routes
const userRoutes = require("./routes/user");
const offerRoutes = require("./routes/offer");

// Initialisation des routes
app.use(userRoutes);
app.use(offerRoutes);

app.listen(process.env.PORT, () => {
  console.log("Server started on port" + process.env.PORT);
});
