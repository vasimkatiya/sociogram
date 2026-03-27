const pool = require("../db/pool");

exports.toggleFollowController = async (req, res) => {
    const followerId = req.user?.id; // logged-in user
    const { followingId } = req.body; // user to follow

    if (!followerId || !followingId) {
        return res.status(400).json({
            success: false,
            message: 'Missing data'
        });
    }

    // Prevent self-follow (extra safety)
    if (followerId === followingId) {
        return res.status(400).json({
            success: false,
            message: "You can't follow yourself"
        });
    }

    // Check already following
    const check = await pool.query(
        'SELECT * FROM follows WHERE follower_id = $1 AND following_id = $2',
        [followerId, followingId]
    );

    let message = '';

    if (check.rows.length > 0) {
        // 👉 Unfollow
        await pool.query(
            'DELETE FROM follows WHERE follower_id = $1 AND following_id = $2',
            [followerId, followingId]
        );
        message = 'Unfollowed';
    } else {
        // 👉 Follow
        await pool.query(
            'INSERT INTO follows (follower_id, following_id) VALUES ($1, $2)',
            [followerId, followingId]
        );
        message = 'Followed';
    }

    // 👉 Get updated counts
    const followersCount = await pool.query(
        'SELECT COUNT(*) FROM follows WHERE following_id = $1',
        [followingId]
    );

    const followingCount = await pool.query(
        'SELECT COUNT(*) FROM follows WHERE follower_id = $1',
        [followerId]
    );

    res.status(200).json({
        success: true,
        message,
        followers: parseInt(followersCount.rows[0].count),
        following: parseInt(followingCount.rows[0].count)
    });
};