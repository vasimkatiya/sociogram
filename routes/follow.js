//follow routes

const { Router } = require("express");
const { toggleFollowController } = require("../controllers/follow");
const { authValid } = require("../middleware/auth");

const followRouter = Router();

followRouter.post("/follow",authValid,toggleFollowController);

module.exports = followRouter;