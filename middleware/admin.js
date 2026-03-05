const { User } = require('../models/user');

module.exports = async function requireAdmin(req,res,next){
    try{
        const userId = req.user.id;
        const user = await User.findById(userId);

        if(!user){
            return res.status(404).json({
                success:false,
                message:"User not found"
            });
        }

        if(user.role !== 'admin'){
            return res.status(403).json({
                success:false,
                message:"Access denied. Admin only"
            });
        }

        next();

    }catch(err){
        console.log(err);
        res.status(500).json({
            success:false,
            message:"Server error"
        });
    }
}