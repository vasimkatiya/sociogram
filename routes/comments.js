// comments routes

const { Router } = require("express");
const { addCommentController, getCommentController, deleteCommentController } = require("../controllers/comments");
const { authValid } = require("../middleware/auth");

const commentRouter = Router();

commentRouter.post('/posts/:id/comments',authValid,addCommentController);
commentRouter.get("/posts/:id/comments",getCommentController);
commentRouter.delete("/comments/:commentId",authValid,deleteCommentController)

module.exports = commentRouter;

