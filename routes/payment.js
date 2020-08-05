const express = require("express");
const router = express.Router();
const stripe = require("stripe")(process.env.STRIPE_API_SECRET);
const formidableMiddleware = require("express-formidable");
const cors = require("cors");

router.use(cors());

router.use(formidableMiddleware());

const User = require("../models/User");
const Offer = require("../models/Offer");
const Transaction = require("../models/Transaction");

// Procéder au paiement pour une annonce
router.post("/payment", async (req, res) => {
  // Création de la transaction
  const response = await stripe.charges.create({
    amount: req.fields.price,
    currency: "eur",
    description: `Paiement leboncoin pour ${req.fields.title}`,
    source: req.fields.stripeToken,
  });
  console.log(response.status);

  res.json(response);

  // // Création d'une nouvelle transaction en BDD
  // const newTransaction = new Transaction({
  //   title: response.title,
  //   price: response.price,
  //   buyer: response.buyer,
  //   token: response.token,
  //   created: new Date(),
  // });

  // await newTransaction.save();

  // // Réponse au client
  // return res.status(200).json({
  //   _id: newTransaction._id,
  //   title: response.title,
  //   price: response.price,
  //   buyer: response.buyer,
  //   created: new Date(),
  // });
});

module.exports = router;
