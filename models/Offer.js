const mongoose = require("mongoose");

const Offer = mongoose.model("Offer", {
  title: String,
  description: String,
  price: Number,
  picture: Object,
  creator: {
    // On fait référence à l'utilisateur
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  created: Date,
});

module.exports = Offer;
