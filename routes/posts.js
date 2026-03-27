//post routes

const { Router } = require("express");
const { createPostController, getPostController, singlePostController, deletePostController } = require("../controllers/posts");
const { authValid } = require("../middleware/auth");

const multer = require("multer");

const upload = multer({
    storage:multer.memoryStorage(),
});

const postRouter = Router();

postRouter.post('/posts',authValid,upload.single("img"),createPostController);
postRouter.get('/posts',authValid,getPostController);
postRouter.get("/posts/:id",authValid,singlePostController);
postRouter.delete("/posts/:id",authValid,deletePostController);


module.exports = postRouter;

