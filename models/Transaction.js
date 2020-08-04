const mongoose = require("mongoose");

const Transaction = mongoose.model("Transaction", {
  title: String,
  price: Number,
  buyer: String,
  token: String,
  created: Date,
});

module.exports = Transaction;
