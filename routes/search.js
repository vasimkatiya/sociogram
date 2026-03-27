const { Router } = require("express");
const { searchController } = require("../controllers/search");

const searchRouter = Router();

searchRouter.get('/',searchController)

module.exports = searchRouter;