const pool = require("../db/pool");
const { uploadFiles } = require("../services/ImageKit");

exports.createPostController = async (req,res)=>{

    const userId = req.user.id;
    const content = req.body.content;
    const file = req.file;

    if(!userId || !content || !file ){
        return res.status(400).json({
            success:false,
            message:'fill all the fields.'
        });
    };

    const result = await uploadFiles(file.buffer.toString('base64'));

    const image_url = result.url;
    const thumbnail_url = result.thumbnailUrl;

    const CreatePost = await pool.query('INSERT INTO posts (user_id,content,image_url,thumbnail_url) VALUES($1,$2,$3,$4)RETURNING *;',[userId,content,image_url,thumbnail_url]);

    const newPost = CreatePost.rows[0];

    res.status(201).json({
        success:true,
        message:'post uploaded successfully.',
        newPost:newPost
    });
    
}

exports.getPostController = async (req,res)=>{

    const fetchPosts = await pool.query('SELECT * FROM posts ORDER BY created_at DESC;');

    if(fetchPosts.rows.length === 0){
        return res.status(401).json({
            success:false,
            message:'post not created.',
            posts:[],
        })
    }

    const allPosts = fetchPosts.rows;

    res.status(200).json({
        success:true,
        message:'all posts fetched successfully.',
        posts:allPosts
    });

}