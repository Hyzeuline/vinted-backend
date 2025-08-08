const User = require("../models/User");
//je vérifie que mon user est authentifié
const isAuthenticated = async (req, res, next) => {
  if (req.headers.authorization) {
    const findUser = await User.findOne({
      //je recherche le token est présent en db
      token: req.headers.authorization.replace("Bearer ", ""), // je retire le "Bearer " du token pour pouvoir le comparer aux autres token dans la db
    });

    if (!findUser) {
      return res.status(401).json({ error: "Unauthorized" }); // sinon je ne l'autorise pas à poster s'il n'a pas de compte
    } else {
      //si le token existe alors :
      req.user = findUser; //transmission de l'utilisateur // création d'une nouvelle clé
      return next(); //permet de passer au code suivant
    }
  } else {
    return res.status(401).json({ error: "Unauthorized" }); // sinon je ne l'autorise pas à poster s'il n'a pas de compte'
  }
};

module.exports = isAuthenticated;
