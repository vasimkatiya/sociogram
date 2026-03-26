const pool = require("../db/pool");
const bcrypt = require('bcryptjs');
const { uploadFiles } = require("../services/ImageKit");
const jwt = require('jsonwebtoken');
require('dotenv').config();

exports.registerController = async (req,res) =>{
    const {username,password,bio} = req.body;
    const file = req.file;

    const isExists = await pool.query('select * from users where username = $1',[username]);

    if(isExists.rows.length > 0){
        return res.status(400).json({
            success:false,
            message:'user already exists.'
        });
    }

    const hashPassword = await bcrypt.hash(password,10);

    const result = await uploadFiles(file.buffer.toString('base64'));

    console.log(result)

    const avatar_url = result.url;

    const newUser = await pool.query('INSERT INTO users (username,password,bio,avatar_url) VALUES($1,$2,$3,$4);',[username,hashPassword,bio,avatar_url]);

   const user = newUser.rows[0]; 

   res.status(201).json({
    success:true,
    user:user,
    message:'user created successfully.'
   });

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