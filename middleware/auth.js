const jwt = require('jsonwebtoken');
require('dotenv').config();


exports.authValid = (req,res,next)=>{

    const token = req.cookies.token;

    if(!token)
    {
        return res.status(401).json({
            success:false,
            message:'user is not logged in.'
        });
    };

    const decoded = jwt.verify(token,process.env.JWT_SECRET);

   
    req.user = decoded;

    next();


}