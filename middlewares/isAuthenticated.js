const User = require("../models/User");

const isAuthenticated = async (req, res, next) => {
  // Le token envoyé en requête dans postman : console.log(req.headers.authorization) renvoie "Bearer " + token
  const authorization = req.headers.authorization;
  if (authorization) {
    // On enlève "Bearer " pour manipuler le token
    const token = authorization.replace("Bearer ", "");
    // On cherche un user qui possède le token en BDD
    const user = await User.findOne({ token: token });
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    } else {
      // On crée une clé "user" dans req pour donner accès aux infos du user dans la route qui utilisera ce middleware
      req.user = user;
      return next();
    }
  } else {
    return res.status(401).json({ message: "Unauthorized" });
  }
};

module.exports = isAuthenticated;
