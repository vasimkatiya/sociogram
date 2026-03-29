const bcrypt = require('bcryptjs');
const pool = require("../db/pool");
const { uploadFiles } = require("../services/ImageKit");
const jwt = require('jsonwebtoken');
require('dotenv').config();

// exports.registerController = async (req, res) => {
//   try {
//     const { username, password, bio } = req.body;
//     const file = req.file;

//     if (!username || !password) {
//       return res.status(400).json({
//         success: false,
//         message: "username & password required"
//       });
//     }

//     if (!file) {
//       return res.status(400).json({
//         success: false,
//         message: "avatar is required"
//       });
//     }

//     const isExists = await pool.query(
//       'select * from users where username = $1',
//       [username]
//     );

//     if (isExists.rows.length > 0) {
//       return res.status(400).json({
//         success: false,
//         message: 'user already exists.'
//       });
//     }

//     const hashPassword = await bcrypt.hash(password, 10);

//     const result = await uploadFiles(file.buffer.toString('base64'));

//     const avatar_url = result.thumbnailUrl;

//     const newUser = await pool.query(
//       'INSERT INTO users (username,password,bio,avatar_url) VALUES($1,$2,$3,$4) RETURNING *;',
//       [username, hashPassword, bio, avatar_url]
//     );

//     res.status(201).json({
//       success: true,
//       user: newUser.rows[0],
//       message: 'user created successfully.'
//     });

//   } catch (error) {
//     console.error("REGISTER ERROR:", error);

//     res.status(500).json({
//       success: false,
//       message: "Internal Server Error"
//     });
//   }
// };


exports.registerController = async (req, res) => {
  try {
    const { username, password, bio } = req.body;
    const file = req.file;

    if (!username || !password) {
      return res.status(400).json({ success: false, message: "Username & password required" });
    }

    if (!file) {
      return res.status(400).json({ success: false, message: "Avatar is required" });
    }

    // Check if user exists
    const userExists = await pool.query("SELECT * FROM users WHERE username = $1", [username]);
    if (userExists.rows.length > 0) {
      return res.status(400).json({ success: false, message: "Username already taken" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Upload avatar to ImageKit safely
    let avatar_url = '';
    try {
      const uploadResult = await uploadFiles(file.buffer.toString('base64'));
      avatar_url = uploadResult?.url || uploadResult?.thumbnailUrl || '';
    } catch (err) {
      console.error("ImageKit upload error:", err);
      avatar_url = ''; // fallback to empty string
    }

    // Insert new user into DB
    const newUser = await pool.query(
      "INSERT INTO users (username, password, bio, avatar_url) VALUES ($1, $2, $3, $4) RETURNING *",
      [username, hashedPassword, bio || '', avatar_url]
    );

    console.log(newUser.rows[0]);
    

    res.status(201).json({ success: true, user: newUser.rows[0], message: "User created successfully" });

  } catch (err) {
    console.error("REGISTER ERROR:", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

exports.loginController = async (req,res)=>{
    const {username,password} = req.body;

    const fetchUser = await pool.query('SELECT * FROM users WHERE username = $1',[username]);

    if(fetchUser.rows.length === 0){
        return res.status(404).json({
            success:false,
            message:'user not found.'
        });
    }

    const user = fetchUser.rows[0];

    const match = await bcrypt.compare(password,user.password);

    if(!match){
        return res.status(401).json({
            success:false,
            message:'password is incorrect'
        });
    };

    const token = jwt.sign({id:user.id},
        process.env.JWT_SECRET,
    );

res.cookie("token", token, {
  httpOnly: true,
  secure: true,
  sameSite: "strict",
});

    res.status(201).json({
        success:true,
        message:'user logged in and token is created.',
        user,
    });

}

exports.logoutController = (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: true,      // true in production (HTTPS)
      sameSite: "strict"
    });

    res.status(200).json({
      success: true,
      message: "Logged out successfully"
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};