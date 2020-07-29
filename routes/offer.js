const express = require("express");
const router = express.Router();

const User = require("../models/User");
const Offer = require("../models/Offer");
const isAuthenticated = require("../middlewares/isAuthenticated");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: "tomp",
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

// Publier une annonce
router.post("/offer/publish", isAuthenticated, async (req, res) => {
  //   console.log(req.user);
  try {
    // Pour tester le passage des paramètres et des fichiers dans postman :
    // console.log(req.fields);
    // console.log(req.files);
    // pour pouvoir mieux lire le fichier qu'on a envoyé en requête : console.log(Object.keys(req.files));
    // console.log(req.files.path) : path étant ce qu'on cherchait

    let pictureToUpload = req.files.picture.path;
    const description = req.fields.description;
    const price = req.fields.price;
    const title = req.fields.title;

    // Checker si on a bien tous les paramètres
    if (pictureToUpload && description && price && title) {
      // Checker si la description fait bien moins de 500 caractères
      if (description.length > 500) {
        return res
          .status(406)
          .json({ message: "Description must be less than 500 characters" });
      } else {
        // Checker si le titre fait bien moins de 50 caractères
        if (title.length > 50) {
          return res
            .status(406)
            .json({ message: "Title must be less than 50 characters" });
        } else {
          // Checker si le prix est inférieur à 100 000 €
          if (price > 100000) {
            return res
              .status(406)
              .json({ message: "Price must be less than 100,000€" });
          } else {
            const pictureUploaded = await cloudinary.uploader.upload(
              pictureToUpload
            );
            // return res.status(200).json(pictureUploaded);
            // Création d'une nouvelle offre en BDD
            const newOffer = new Offer({
              title: title,
              description: description,
              price: price,
              picture: pictureUploaded,
              creator: req.user,
              created: new Date(),
            });

            await newOffer.save();

            // Réponse au client
            return res.status(200).json({
              _id: newOffer._id,
              title: title,
              description: description,
              price: price,
              picture: pictureUploaded,
              creator: {
                account: newOffer.creator.account,
                _id: newOffer.creator._id,
              },
              created: new Date(),
            });
          }
        }
      }
    } else {
      return res.status(400).json({ message: "Missing parameters" });
    }
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

// Afficher et filtrer l'ensemble des annonces
router.get("/offer/with-count", async (req, res) => {
  try {
    // Filtres
    // On crée un objet auquel on va rajouter des clés avec pour valeur les éléments de la requête
    const filters = {};
    if (req.query.priceMin) {
      filters.price = {
        $gte: req.query.priceMin,
      };
    }
    if (req.query.priceMax) {
      // Pour gérer le cas où la requête envoie un priceMin ET un priceMax, on vérifie d'abord s'il existe déjà une clé price dans l'objet filters, pour éviter de réassigner la clé price, et ainsi juste rajouter une clé $lte à l'objet filters.price
      if (filters.price) {
        filters.price.$lte = req.query.priceMax;
      } else {
        filters.price = {
          $lte: req.query.priceMax,
        };
      }
    }
    if (req.query.title) {
      filters.title = new RegExp(req.query.title, "i");
    }

    // Tri
    // Même chose que pour les filtres : on crée un objet sorting
    let sorting = {};
    if (req.query.sort) {
      // Ici on va récupérer les valeurs de la requête sort et les mettre dans un tableau en séparant le filtre (ex : "price") et le type de filtre (ex : "asc")
      const sortArray = req.query.sort.split("-");
      const sortFilter = sortArray[0];
      const sortFilterType = sortArray[1];
      if (sortFilter === "price") {
        sorting.price = sortFilterType;
      }
      if (sortFilter === "date") {
        sorting.created = sortFilterType;
      }
    }
    // Par défaut, on trie par date de la plus récente à la plus ancienne
    else {
      sorting.created = "desc";
    }

    let page = Number(req.query.page);
    let limit = Number(req.query.limit);

    // Forcer à afficher la première page
    if (!page) {
      page = 1;
    }

    if (limit) {
      const offers = await Offer.find(filters)
        .skip((page - 1) * 2)
        .limit(limit)
        .sort(sorting)
        // Pour dérouler certaines informations d'une clé : on utilise populate() avec des filtres : path => la clé qu'on veut dérouler, select => les clés qu'on veut afficher
        .populate({
          path: "creator",
          select: "account.username account.phone",
        });

      // Réponse au client
      res.status(200).json({
        count: offers.length,
        offers: offers,
      });
    }
    // Par défaut, on limite l'affichage à 3 annonces par page
    else {
      const offers = await Offer.find(filters)
        .skip((page - 1) * 2)
        .limit(3)
        .sort(sorting)
        .populate({
          path: "creator",
          select: "account.username account.phone",
        });

      // Réponse au client
      res.status(200).json({
        count: offers.length,
        offers: offers,
      });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Afficher une annonce en particulier
// Ici on utilise "params" au lieu de "query", la syntaxe de l'url est donc différente
router.get("/offer/:id", async (req, res) => {
  try {
    // On va juste chercher l'offre dont l'id correspond à celui envoyé en requête
    const offer = await Offer.findById(req.params.id).populate({
      path: "creator",
      select: "account.username account.phone",
    });

    // Réponse au client
    res.status(200).json(offer);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
