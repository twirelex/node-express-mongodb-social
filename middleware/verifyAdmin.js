const User = require('../model/User')

const verifyAdmin = (...roles) => {
    return (req, res, next) => {
        const userRoles = Object.values(req.user.roles)
    
        const foundRoles = userRoles.map(role => roles.includes(role)).find(result => result === true)
        if(!foundRoles) return res.status(403).json({message: "You are not authorized"})

        next()
    }
}


module.exports = verifyAdmin