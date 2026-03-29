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
    console.log("REQ.BODY:", req.body);
    console.log("REQ.FILE:", req.file);

    const { username, password, bio } = req.body;
    const file = req.file;

    if (!username || !password) {
      console.log("Missing username or password");
      return res.status(400).json({ success: false, message: "Username & password required" });
    }
    if (!file) {
      console.log("Missing avatar file");
      return res.status(400).json({ success: false, message: "Avatar is required" });
    }

    // Check if user exists
    const userExists = await pool.query("SELECT * FROM users WHERE username = $1", [username]);
    console.log("User exists check:", userExists.rows);

    if (userExists.rows.length > 0) {
      console.log("Username already taken");
      return res.status(400).json({ success: false, message: "Username already taken" });
    }

    // Hash password
    let hashedPassword;
    try {
      hashedPassword = await bcrypt.hash(password, 10);
      console.log("Password hashed successfully");
    } catch (err) {
      console.error("Bcrypt error:", err);
      return res.status(500).json({ success: false, message: "Password hashing failed" });
    }

    // Upload avatar
    let avatar_url = '';
    try {
      const uploadResult = await uploadFiles(file.buffer.toString('base64'));
      console.log("ImageKit upload result:", uploadResult);
      avatar_url = uploadResult?.url || uploadResult?.thumbnailUrl || '';
    } catch (err) {
      console.error("ImageKit upload error:", err);
      avatar_url = ''; // fallback
    }

    // Insert into DB
    let newUser;
    try {
      newUser = await pool.query(
        "INSERT INTO users (username, password, bio, avatar_url) VALUES ($1, $2, $3, $4) RETURNING *",
        [username, hashedPassword, bio || '', avatar_url]
      );
      console.log("User inserted:", newUser.rows[0]);
    } catch (err) {
      console.error("DB insert error:", err);
      return res.status(500).json({ success: false, message: "Database insert failed" });
    }

    res.status(201).json({ success: true, user: newUser.rows[0], message: "User created successfully" });

  } catch (err) {
    console.error("Unexpected register error:", err);
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

    console.log(fetchUser.rowCount);
    

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