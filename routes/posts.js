//post routes

const { Router } = require("express");
const { createPostController, getPostController } = require("../controllers/posts");
const { authValid } = require("../middleware/auth");

const multer = require("multer");

const upload = multer({
    storage:multer.memoryStorage(),
});

const postRouter = Router();

postRouter.post('posts',authValid,upload.single("image"),createPostController);
postRouter.get('/posts',getPostController)

module.exports = postRouter;