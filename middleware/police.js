const { User } = require('../models/user');

module.exports = async function requirePolice(req,res,next){

    try{
        const user = await User.findById(req.user.id);

        if(!user){
            return res.status(404).json({
                success:false,
                message:"User not found"
            });
        }

        if(user.role !== 'police' && user.role !== 'admin'){
            return res.status(403).json({
                success:false,
                message:"Police access required"
            });
        }

        next();

    }catch(err){
        res.status(500).json({
            success:false,
            message:"Server error"
        });
    }

}