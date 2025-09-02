const express = require("express");
const router = express.Router();

// Pensez à cacher votre clef privée dans votre .env
const stripe = require("stripe")(process.env.SECRET_KEY_STRIPE);

router.post("/payment", async (req, res) => {
  try {
    // On crée une intention de paiement
    const paymentIntent = await stripe.paymentIntents.create({
      // Montant de la transaction
      amount: req.body.product_price * 100,
      // Devise de la transaction
      currency: "eur",
      // Description du produit
      title: req.body.product_name,
    });
    // On renvoie les informations de l'intention de paiement au client
    res.json(paymentIntent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
