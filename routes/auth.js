//auth routes

const { Router } = require("express");
const { registerController, loginController, logoutController } = require("../controllers/auth");
const multer = require("multer");

const upload = multer({
    storage:multer.memoryStorage(),
});

const authRouter = Router();

authRouter.post('/register',upload.single('avatar'),registerController);

authRouter.post('/login',loginController);

authRouter.post("/logout", logoutController);

module.exports = authRouter;