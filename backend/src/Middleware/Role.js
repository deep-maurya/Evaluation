const { userModel } = require("../Module/userModule");

const Role_Auth = (roles) =>{
    return async(req,res,next)=>{
        const user = req.user;
        console.log(user.email)
        const user_data =await userModel.findOne({email:user.email}) 
        if(user_data!=null){
            if(roles.includes(user_data.role)){
                next();
            } else {
                if(roles.includes(user_data.role)){
                    next();
                } else {
                    return res.status(401).json({ status: 0, message: "Role is not for this Action", data: [] });
                }
            }
        } else {
            return res.status(401).json({ status: 0, message: "invalid Action please login again", data: [] });
        }
    }
}

module.exports = {Role_Auth}