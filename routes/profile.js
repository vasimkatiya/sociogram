//users route

const { Router } = require("express");
const { myProfileController, usersProfileController, updateProfileController } = require("../controllers/profile");
const { authValid } = require("../middleware/auth");
const multer = require("multer");



const userRouter = Router();

const upload = multer({
    storage:multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
});

userRouter.get("/:id",authValid,usersProfileController);
userRouter.get('/profile/me',authValid,myProfileController);
userRouter.post("/update",authValid,upload.single('new-avatar'),updateProfileController);

module.exports = userRouter;