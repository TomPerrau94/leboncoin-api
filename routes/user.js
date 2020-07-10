const express = require("express");
const router = express.Router();

const User = require("../models/User");

const encBase64 = require("crypto-js/enc-base64");
const uid2 = require("uid2");
const SHA256 = require("crypto-js/sha256");

// Un utilisateur crée un compte
router.post("/user/sign_up", async (req, res) => {
  try {
    const email = req.fields.email;
    const username = req.fields.username;
    const phone = req.fields.phone;
    const password = req.fields.password;
    const userExists = await User.findOne({ email: email });

    if (email && username && password) {
      if (userExists) {
        res.status(400).json({ message: "This email is already registered" });
      } else {
        // On crée une chaîne de caractères aléatoires appelée salt qu'on va rajouter après le password
        const salt = uid2(16);
        // On encrypte le password et le salt
        const hash = SHA256(password + salt).toString(encBase64);
        // On crée une chaîne de caractère aléatoires pour le token relatif à chaque user
        const token = uid2(16);

        const newUser = new User({
          email: email,
          token: token,
          hash: hash,
          salt: salt,
          account: {
            username: username,
            phone: phone,
          },
        });
        // console.log(newUser);
        await newUser.save();

        // Réponse au client
        res.status(200).json({
          _id: newUser._id,
          email: newUser.email,
          token: newUser.token,
          account: newUser.account,
        });
      }
    } else {
      res.status(400).json({ message: "Missing parameters" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Connexion d'un utilisateur
router.post("/user/log_in", async (req, res) => {
  try {
    const email = req.fields.email;
    const password = req.fields.password;

    const userExists = await User.findOne({ email: email });

    if (userExists) {
      // On crée un novueau hash en encryptant de nouveau le password entré par l'utilisateur avec le salt existant en BDD
      const hash = SHA256(password + userExists.salt).toString(encBase64);
      // console.log(userExists);
      // console.log(hash);
      // console.log(userExists.salt);

      // Si le nouveau hash équivaut à celui existant en BDD alors l'utilisateur peut se connnecter
      if (hash === userExists.hash) {
        res.status(200).json({
          _id: userExists._id,
          token: userExists.token,
          email: userExists.email,
          account: userExists.account,
        });
      } else {
        res.status(400).json({ message: "Invalid password, try again" });
      }
    } else {
      res.status(404).json({ message: "This email address is not registered" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
