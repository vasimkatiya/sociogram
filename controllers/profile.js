const pool = require("../db/pool");
const { uploadFiles } = require("../services/ImageKit");

exports.myProfileController = async(req,res)=>{
    const userId = req.user?.id;

    if(!userId)
    {
        return res.status(400).json({
            success:false,
            message:'userId is missing...'
        })
    }

    //check user exists or not 

    const existUser = await pool.query('SELECT * FROM users WHERE id = $1;',[userId]);

    if(existUser.rows.length === 0){
        return res.status(404).json({
            success:false,
            message:'user not found'
        })
    }

    const user = existUser.rows[0];

    // fetch all posts for current user.

    const allPost = await pool.query('SELECT * FROM posts WHERE user_id = $1;',[userId]);

    if(allPost.rows.length === 0){
        return res.status(200).json({
            success:true,
            messgae:'empty posts',
            posts:[]
        });
    }

    const posts = allPost.rows;

    res.status(200).json({
        success:true,
        message:'posts fetched',
        posts:posts,
        user:user
    })

}

exports.usersProfileController = async(req,res)=>{
    const userId = req.params.id;

    if(!userId)
    {
        return res.status(400).json({
            success:false,
            message:'userId is missing...'
        })
    }

    //check user exists or not 

    const existUser = await pool.query('SELECT * FROM users WHERE id = $1;',[userId]);

    if(existUser.rows.length === 0){
        return res.status(404).json({
            success:false,
            message:'user not found'
        })
    }

    const user = existUser.rows[0];

    // fetch all posts for current user.

    const allPost = await pool.query('SELECT * FROM posts WHERE user_id = $1;',[userId]);

    if(allPost.rows.length === 0){
        return res.status(200).json({
            success:true,
            message:'empty posts',
            posts:[]
        });
    }

    const posts = allPost.rows;

    res.status(200).json({
        success:true,
        message:'posts fetched',
        posts:posts,
        user:user
    })

}

exports.updateProfileController = async (req,res)=>{
    const userId = req.user?.id;
    const {username,bio} = req.body;
    const file = req.file;

    const existUser = await pool.query('SELECT * FROM users WHERE id = $1;',[userId]);

     if(existUser.rows.length === 0){
        return res.status(404).json({
            success:false,
            message:'user not found'
        })
    }

    const oldUser = existUser.rows[0];

    let avatar_url = oldUser.avatar_url;

   if(file){
    const result = await uploadFiles(file.buffer.toString('base64'));
    avatar_url = result.url;
    }

    const newUsername = username || oldUser.username;
    const newBio = bio || oldUser.bio;

    const updateUser = await pool.query("UPDATE users SET username = $1,  bio = $2, avatar_url = $3 WHERE id = $4 RETURNING * ;",[newUsername,newBio,avatar_url,userId]);
    
    res.status(200).json({
        success:true,
        message:'update successfully.',
        oldUser:oldUser,
        updateUser:updateUser.rows[0]
    });

};

