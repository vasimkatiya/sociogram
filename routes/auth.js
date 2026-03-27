//auth routes

const { Router } = require("express");
const { registerController, loginController, logoutController } = require("../controllers/auth");
const multer = require("multer");
const { authValid } = require("../middleware/auth");

const upload = multer({
    storage:multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
});

const authRouter = Router();

authRouter.post('/register',upload.single('avatar'),registerController);

authRouter.post('/login',loginController);

authRouter.post("/logout", logoutController);

authRouter.get('/api/me', authValid, (req, res) => {
  res.json({
    success: true,
    user: req.user
  });
});

module.exports = authRouter;

