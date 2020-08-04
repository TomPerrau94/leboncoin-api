const express = require("express");
const router = express.Router();
const stripe = require("stripe")(process.env.STRIPE_API_SECRET);

const isAuthenticated = require("../middlewares/isAuthenticated");

// Procéder au paiement pour une annonce

module.exports = router;
