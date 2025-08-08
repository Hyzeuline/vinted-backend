const express = require("express");
const router = express.Router();
const User = require("../models/User");
const uid = require("uid2");
const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");

router.post("/user/signup", async (req, res) => {
  try {
    //je vérifie que mon email n'existe pas
    const verifEmail = await User.findOne({ email: req.body.email });
    //console.log(verifEmail);
    if (verifEmail) {
      return res
        .status(400)
        .json({ message: "This email does already exist !" });
    }
    //je vérifie que les paramètres sont inscrits
    if (
      !req.body.username ||
      !req.body.email ||
      !req.body.password ||
      !req.body.newsletter
    ) {
      return res.status(400).json({ message: "Missing parameters !" });
    }

    // Vérifier que le mail contient @.
    //Vérfier que le mdp est sécurisé

    // je crypte mon mdp avant de l'ajouter dans ma db
    const salt = uid(24);
    const saltedPassword = req.body.password + salt;
    const cryptedPassword = SHA256(saltedPassword);
    const hash = encBase64.stringify(cryptedPassword);
    const token = uid(32);

    const newUser = new User({
      email: req.body.email,
      account: {
        username: req.body.username,
      },
      newsletter: req.body.newsletter,
      token,
      hash,
      salt,
    });

    //console.log(newUser);
    //j'enregistre mon nouvel utilisateur
    await newUser.save();
    //je crée un nouveau schéma de réponse que je veux renvoyer
    const userDetails = {
      _id: newUser._id,
      token: newUser.token,
      account: { username: newUser.account.username },
    };
    return res.status(201).json(userDetails);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.post("/user/login", async (req, res) => {
  try {
    const existUser = await User.findOne({ email: req.body.email });
    if (!existUser) {
      return res.status(400).json("Password or email not valid !");
    }
    const userSalt = existUser.salt;
    const userHash = existUser.hash;
    const newHash = SHA256(req.body.password + userSalt).toString(encBase64);

    if (newHash !== userHash) {
      return res.status(401).json({ message: "Password or email not valid !" });
    }
    const userDetails = {
      _id: existUser._id,
      token: existUser.token,
      account: { unsername: existUser.account.username },
    };
    return res.status(200).json({ userDetails });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

module.exports = router;
