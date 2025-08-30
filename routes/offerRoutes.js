const express = require("express");
const router = express.Router();
const Offer = require("../models/Offer");
const User = require("../models/User");
const cloudinary = require("cloudinary").v2;
const fileUpload = require("express-fileupload");
const mongoose = require("mongoose");
const isAuthenticated = require("../middleware/isAuthenticated");

router.post(
  "/offer/publish",
  isAuthenticated, //insertion du middleware de l'authentification en premier avant d'upload l'image
  fileUpload(), //pour pouvoir lire les form-data, c'est un middleware
  async (req, res) => {
    // conversion du buffer en base64
    const convertToBase64 = file => {
      return `data:${file.mimetype};base64,${file.data.toString("base64")}`; // la clé data est un buffer (format en bytes)
    };
    try {
      //si le token existe alors :
      // je créé mon offre
      const newOffer = new Offer({
        product_name: req.body.title,
        product_description: req.body.description,
        product_price: req.body.price,
        product_details: [
          {
            MARQUE: req.body.brand,
          },
          { TAILLE: req.body.size },
          { ÉTAT: req.body.condition },
          { COULEUR: req.body.color },
          { EMPLACEMENT: req.body.city },
        ],
        owner: req.user,
      });
      const convertedPicture = convertToBase64(req.files.picture);
      //j'envoie mon image dans cloudinary :
      const uploadResponse = await cloudinary.uploader.upload(
        convertedPicture,
        { folder: "/vinted/offers/" + newOffer._id } //réponse de cloudinary sous forme d'objet après avoir télécharger l'image dans le drive
      ); // cloudinary.v2.uploader.upload(file, options).then(callback);
      newOffer.product_image = uploadResponse;

      await newOffer.save();
      return res.status(201).json(newOffer);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }
);

router.get("/offers", async (req, res) => {
  try {
    // const findOffers = await Offer.find(); // récupérer l'ensemble des offres sous forme de tableau
    // console.log(findOffers);
    //récupérer le nombre d'offres créées
    // console.log(numOffers);
    // Filter
    const filters = {};
    const sort = {};

    //création des cléfs avec différents filtres

    //filtrer en fonction du nom
    if (req.query.title) {
      filters.product_name = new RegExp(req.query.title, "i");
    }

    //filtrer en fonction jusqu'à un prix minimal (non inclus) et maximal(non inclus)
    if (req.query.priceMin && req.query.priceMax) {
      filters.product_price = {
        $gt: req.query.priceMin,
        $lt: req.query.priceMax,
      };
      //filtrer en fonction d'un prix minimum ou égal
    } else if (req.query.priceMin) {
      filters.product_price = { $gte: req.query.priceMin };
    }
    //filtrer en fonction jusqu'à un prix maximal ou égal
    else if (req.query.priceMax) {
      filters.product_price = { $lte: req.query.priceMax };
    }
    //filtrer par prix décroissant
    if (req.query.sort === "price-desc") {
      sort.product_price = "desc";

      // filtrer par prix croissant
    } else if (req.query.sort === "price-asc") {
      sort.product_price = "asc";
    }
    // pagination
    let page = 1;
    let limit = 10;

    if (req.query.limit) {
      limit = req.query.limit;
    }
    if (req.query.page) {
      page = req.query.page;
    }

    let skip = (page - 1) * limit;

    console.log(filters);
    console.log(sort);
    console.log(page);
    console.log(limit);

    const findOffers = await Offer.find(filters)
      .populate("owner")
      .limit(limit)
      .skip(skip)
      .sort(sort);
    const numOffers = findOffers.length;

    return res.status(200).json({
      count: numOffers,
      offers: findOffers,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.get("/offers/:id", async (req, res) => {
  try {
    const detailsOffer = await Offer.findById(req.params.id).populate("owner");
    return res.status(200).json(detailsOffer);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

module.exports = router;
