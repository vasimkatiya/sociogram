const pool = require("../db/pool");


exports.searchController = async (req,res)=>{
    const search = req.query.search;

    if(!search)
    {
        return res.status(400).json({
            success:false,
           message:'search is require' 
        });
    }

    const result = await pool.query('SELECT * FROM users WHERE username ILIKE $1;',[`%${search}%`]);

    if(result.rows.length === 0)
    {
        return res.status(404).json({
            success:false,
            message:'user not found'
        });
    };

    res.status(200).json({
        success:true,
        message:'matched result fetch',
        result:result.rows
    })

}