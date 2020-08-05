const express = require("express");
const router = express.Router();
const createStripe = require("stripe");
const formidableMiddleware = require("express-formidable");
router.use(formidableMiddleware());

const stripe = createStripe(process.env.STRIPE_API_SECRET);

const User = require("../models/User");
const Offer = require("../models/Offer");
const Transaction = require("../models/Transaction");

// Procéder au paiement pour une annonce
router.post("/payment", async (req, res) => {
  try {
    const response = await stripe.charges.create({
      amount: req.fields.amount,
      currency: "eur",
      description: `Paiement leboncoin pour ${req.fields.title}`,
      source: req.fields.token,
    });
    console.log(response.status);

    res.json(response.status);
  } catch (error) {
    console.log(error);
    res.status(500).end();
  }
  // Création de la transaction

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
