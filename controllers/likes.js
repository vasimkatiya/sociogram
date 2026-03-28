const pool = require("../db/pool");

exports.toggleLikesController = async (req, res) => {
    const userId = req.user?.id;
    const { postId } = req.body;

    if (!userId || !postId) {
        return res.status(400).json({
            success: false,
            message: 'userId or postId missing...'
        });
    }

    // Check if user already liked the post
    const check = await pool.query(
        'SELECT * FROM likes WHERE user_id = $1 AND post_id = $2;',
        [userId, postId]
    );

    let message = '';
    if (check.rows.length > 0) {
        // If liked, remove the like
        await pool.query(
            'DELETE FROM likes WHERE user_id = $1 AND post_id = $2;',
            [userId, postId]
        );
        message = 'Post unliked';
    } else {
        // If not liked, add a like
        await pool.query(
            'INSERT INTO likes (user_id, post_id) VALUES ($1, $2);',
            [userId, postId]
        );
        message = 'Post liked';
    }

    // Fetch current total likes count for the post
    const likeCountResult = await pool.query(
        'SELECT COUNT(*) FROM likes WHERE post_id = $1;',
        [postId]
    );
    const likeCount = parseInt(likeCountResult.rows[0].count);

    res.status(200).json({
        success: true,
        message: message,
        likesCount: likeCount,
        userId:userId
    });
};