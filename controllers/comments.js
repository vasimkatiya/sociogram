
const pool = require("../db/pool");
const { post } = require("../routes/auth");

exports.addCommentController = async (req,res)=>{

    const {id} = req.params;
    const userId = req.user?.id;
    const {content} = req.body;
    
    console.log(userId)

    if(!userId || !id || !content){

        return res.status(400).json({
            success:false,
            message:'fill all the fields.'
        });

    }

    const post = await pool.query('SELECT * FROM posts WHERE id = $1;',[id]);

    if(post.rows.length === 0)
    {
        return res.status(404).json({
            success:false,
            message:'post not found.',
        });
    };



    const createComments = await pool.query('INSERT INTO comments (user_id,post_id,content) VALUES($1,$2,$3) RETURNING *;',[userId,id,content]);

    const newComments = createComments.rows[0];

    res.status(201).json({
        success:true,
        message:'new comments created.',
        newComment:newComments,
    });

}

exports.getCommentController = async (req,res)=>{

    const {id} = req.params;

    
    const allComments = await pool.query('SELECT * FROM comments WHERE post_id = $1 ORDER BY created_at DESC;',[id]);

    if(allComments.rows.length === 0)
    {
        return res.status(400).json({
            success:false,
            message:'No Comments.',
        });
    }

    const comments = allComments.rows;

    res.status(200).json({
        success:true,
        message:'fetched all comments successfully.',
        comments:comments,
    });

}

exports.deleteCommentController = async (req,res)=>{

    const {commentId} = req.params;
    const userId = req.user?.id;

    if(!commentId){
        return res.status(400).json({
            success:false,
            message:'commentId not found.'
        });
    };

    const comment = await pool.query('SELECT * FROM comments WHERE id = $1;',[commentId]);

    if(comment.rows.length === 0)
    {
        return res.status(404).json({
            success:false,
            message:'comments not found.'
        });
    };

    //authorization
    if(comment.rows[0].user_id !== userId)
    {
        return res.status(403).json({
            success:false,
            message:'unauthorized',
        });
    };

    await pool.query("DELETE FROM comments WHERE id = $1;",[commentId]);

    res.status(200).json({
        success:true,
        message:"comment deleted successfully",
    });
};
