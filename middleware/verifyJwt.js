const jwt = require('jsonwebtoken')
const User = require('../model/User')

const verifyJwt = (req, res, next) => {
    if(!req.headers.authorization) return res.status(403).json({message: "You do not have access to this page"})
    const token = req.headers.authorization.split(' ')[1]
    if(!token) return res.status(403).json({message: "You do not have access to this page"})

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if(err) return res.status(401).json({message: "Invalied or expired token"})
        req.user = decoded

        next()
    })
}

module.exports = verifyJwt

