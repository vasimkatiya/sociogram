const pool = require("../db/pool");
const { uploadFiles } = require("../services/ImageKit");

exports.createPostController = async (req,res)=>{

    const userId = req.user?.id;
    const content = req.body.content;
    const file = req.file;

    if(!userId || (!content && !file) ){
        return res.status(400).json({
            success:false,
            message:'fill all the fields.'
        });
    };

    let image_url = null;
    let thumbnail_url = null;

    if(file){
        const result = await uploadFiles(file.buffer.toString('base64'));
        
        image_url = result.url;
        thumbnail_url = result.thumbnailUrl;
    }

    const CreatePost = await pool.query('INSERT INTO posts (user_id,content,image_url,thumbnail_url) VALUES($1,$2,$3,$4)RETURNING *;',[userId,content,image_url,thumbnail_url]);

    const newPost = CreatePost.rows[0];

    res.status(201).json({
        success:true,
        message:'post uploaded successfully.',
        newPost:newPost,
        user_id:req.user?.id,
    });
    
}

exports.getPostController = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 10;
  const offset = (page - 1) * limit;

  const fetchPosts = await pool.query(
    `SELECT 
        posts.*, 
        users.username, 
        users.id AS user_id,
        COUNT(likes.id) AS like_count
     FROM posts
     JOIN users ON posts.user_id = users.id
     LEFT JOIN likes ON posts.id = likes.post_id
     GROUP BY posts.id, users.id
     ORDER BY posts.created_at DESC
     LIMIT $1 OFFSET $2`,
    [limit, offset]
  );

  res.status(200).json({
    success: true,
    message: 'posts fetched successfully.',
    posts: fetchPosts.rows,
    current_user: req.user?.id,
  });
};


exports.singlePostController = async (req, res) => {
  const { id } = req.params;

  const post = await pool.query(
    `SELECT 
        posts.*, 
        users.username, 
        users.id AS user_id,
        COUNT(likes.id) AS like_count
     FROM posts
     JOIN users ON posts.user_id = users.id
     LEFT JOIN likes ON posts.id = likes.post_id
     WHERE posts.id = $1
     GROUP BY posts.id, users.id`,
    [id]
  );

  if (post.rows.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'post is not found or invalid post id'
    });
  }

  res.status(200).json({
    success: true,
    message: 'single post fetched successfully.',
    post: post.rows[0],
    current_user: req.user?.id,
  });
};

exports.deletePostController = async (req,res)=>{
    const {id} = req.params;
    const userId = req.user?.id;
    const checkPost = await pool.query('SELECT * FROM posts WHERE id = $1 ;',[id]);

      if (checkPost.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }


     if (checkPost.rows[0].user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to delete this post",
      });
    }


    if(id){
        await pool.query('DELETE FROM posts WHERE id = $1 ;',[id]);
    }

    res.status(200).json({
        success:true,
        message:'post deleted successfully.',
        user_id:req.user?.id
    })

}

