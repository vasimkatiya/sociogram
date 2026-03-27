const pool = require("../db/pool");

exports.toggleLikesController = async (req,res)=>{
    const userId = req.user?.id;
    const {postId} = req.body;

    if(!userId || !postId){
        return res.status(400).json({
            success:false,
            message:'userId or postId missing...'
        })
    }

    //check already like

    const check = await pool.query('SELECT * FROM likes WHERE user_id = $1 AND post_id = $2;',[userId,postId]);

    if(check.rows.length > 0){
        await pool.query('DELETE FROM likes WHERE user_id = $1 AND post_id = $2;',[userId,postId]);
        return res.status(200).json({
            success:true,
            message:'post unliked',
        });
    };

    //if not like then add like.

    const newLike = await pool.query('INSERT INTO likes (user_id,post_id) VALUES($1,$2);',[userId,postId]);

    res.status(200).json({
        success:true,
        message:'post liked'
    })

}