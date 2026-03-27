//likes route

const { Router } = require("express");
const { toggleLikesController } = require("../controllers/likes");
const { authValid } = require("../middleware/auth");

const likeRouter = Router();

likeRouter.post('/likes',authValid,toggleLikesController)

module.exports = likeRouter