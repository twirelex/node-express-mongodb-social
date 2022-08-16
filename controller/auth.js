const User = require("../model/User")
const profile = require('../model/UserProfile')
const jwt = require('jsonwebtoken')
require('dotenv').config()
const bcrypt = require('bcrypt')
const mailgun = require("mailgun-js");
const mg = mailgun({apiKey: process.env.Mailgun_ApiKey, domain: process.env.Mailgun_Domain});




// user inputs his/her details and receives a token for activation 
const handleRegistration = async (req, res) => {
    const newUser = req.body

    if(!newUser.username || !newUser.email || !newUser.password) {
        return res.status(404).json({message: "please input your details"})
    }
// check database to see if there is a user with the provided email address

    const foundUser = await User.findOne({email: newUser.email}).exec()

    if (foundUser) return res.status(409).json({message: "This email is registered"})

// Create a token and send to the user for activation (Mialgun service is used for mailing)
    const token = jwt.sign({
        username: newUser.username,
        email: newUser.email,
        password: newUser.password
    },process.env.activationTokenKey, {expiresIn: '5m'} )

    const data = {
        from: 'noreply@wirelex.com',
        to: newUser.email,
        subject: 'Activation Token',
        text: `https://url/activate/${token}`
    };
    mg.messages().send(data, function (error, body) {
        if(error) return res.status(503).json({message: "activation link could not be sent"})

        res.status(200).json({token})

    });


}

const handleActivation = (req, res) => {
    const token = req.body.token

    if(!token) return res.sendStatus(404)

    jwt.verify(token, process.env.activationTokenKey, async (err, decoded) => {
        if (err) return res.status(401).json({message: "Link expired or invalid"})

        const foundUser = await User.findOne({email: decoded.email}).exec()

        if (foundUser) return res.status(409).json({message: "User already registered"})
        const hashedPassword = await bcrypt.hash(decoded.password, 10)
        const newUser = User({
            username: decoded.username,
            email: decoded.email,
            password: hashedPassword
        })
        await newUser.save()

        const userProfile = profile({
            user: newUser._id
        })
        await userProfile.save()
        const {username, email} = newUser
        res.status(200).json({username: username, email: email})
    })
}

// On log-in the user will be assigned an access token for authorization to be used to access protected routes 
// and also a refresh token which will also be used to generate new access token.
const handleLogin = async (req, res) => {
    const { username, password} = req.body
    if (!username || !password) return res.status(404).json({message: "Please enter username and password"})
    const foundUser = await User.findOne({username: username}).exec()
    if(!foundUser) return res.status(404).json({message: "No user with this username"})

    const match = await bcrypt.compare(password, foundUser.password)

    if(!match) return res.status(403).json({message: "Incorrect password"})

    try {
        const accessToken = jwt.sign( {
            username: foundUser.username,
            roles: foundUser.roles,
            email: foundUser.email,
            id: foundUser._id 
        }, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '3m'})
    
        const refreshToken = jwt.sign( {
            username: foundUser.username,
            roles: foundUser.roles,
            email: foundUser.email,
            id: foundUser._id    
        }, process.env.REFRESH_TOKEN_SECRET, {expiresIn: '1d'})
    
        res.cookie('jwt', refreshToken, {maxAge: 24 * 60 * 60 * 1000})
    
        res.status(200).json({accessToken})
    
        foundUser.refreshToken = refreshToken

        await foundUser.save()

    } catch (err) {res.status(500).json(err)}
}

const handleRefreshToken = async (req, res) => {
    const cookie = req.cookies

    if(!cookie?.jwt) return res.sendStatus(401)

    const foundUser = await User.findOne({refreshToken: cookie.jwt}).exec()

    if(!foundUser) return res.sendStatus(404)

    jwt.verify(cookie.jwt, process.env.REFRESH_TOKEN_SECRET, async(err, decoded) => {
        if (err) return res.status(401).json({message: "Invalid or expired token"})
        const accessToken = jwt.sign({
            username: decoded.username,
            roles: decoded.roles,
            email: decoded.email,
            id:  decoded.id 
        }, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '3m'})

        res.json({accessToken})
    })
}

const handleLogout = async (req, res) => {
const cookie = req.cookies   
if(!cookie?.jwt) return res.status(204).json({message: "Not loged in"})

const foundUser = await User.findOne({refreshToken: cookie.jwt}).exec()

if(foundUser){

    try{
        res.clearCookie('jwt', {maxAge: 24 * 60 * 60 * 1000})
        foundUser.refreshToken = " "

        await foundUser.save()
        return res.status(200).json({message: "Successfully loged out"})
    } catch (err) {return res.json(err)}
}

return res.status(204).json({message: "Not loged in"})
}

const handleForgotPassword = async (req, res) => {
    const emailAddress = req.body.email

    if(!emailAddress) return res.status(404).json({message: "Please enter your email address"})

    const foundUser = await User.findOne({email: emailAddress}).exec()

    if(!foundUser) return res.status(404).json({message: "Email does not exist"})

    try{
        const token = jwt.sign( {
            email: foundUser.email  
        }, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '5m'})
    
        const data = {
            from: 'noreply@wirelex.com',
            to: foundUser.email,
            subject: 'Activation Token',
            text: `https://url/forgot-password/${token}`
        };
        mg.messages().send(data, async function (error, body) {
            if(error) return res.status(500).json({message: "activation link could not be sent"})
    
            res.status(200)
            foundUser.forgotPasswordToken = token

            await foundUser.save()
        })
    } catch (err) {return res.status(500).json(err)}
}


const updatePassword = async (req, res) => {
    const {token, newPassword} = req.body

    if(!token || !newPassword) return res.status(404).json({message: "Email and new password are required"})

    const foundUser = await User.findOne({forgotPasswordToken: token}).exec()

    if(!foundUser) return res.status(404).json({message: "Token expired or invalid"})
   
    jwt.verify(foundUser.forgotPasswordToken, process.env.ACCESS_TOKEN_SECRET, async (err, decoded) => {
        if (err) return res.status(403).json(err)

        const hashedPassword = await bcrypt.hash(newPassword, 10)

        foundUser.password = hashedPassword

        foundUser.forgotPasswordToken = " "

        await foundUser.save()

        res.status(200).json({message: "password updated"})
    })
}

const getUsers = async (req, res) => {
    const allUsers = await User.find()

    return res.json(allUsers)
}

// A user can delete their account. Admins can also delete user accounts
const deleteUser = async (req, res) => {
    const userId = req.params.userId
// 2000 represents admin role
    if(userId == req.user.id || Object.values(req.user.roles).includes(2000) ){
    const foundUser = await User.findOne({_id: userId}).exec()
    if(!foundUser) return res.sendStatus(404)
    await User.findOneAndDelete({_id: userId})
// delete user profile

    await profile.findOneAndDelete({user: userId})

    return res.status(200).json({message: "Account successfully deleted"})
        
    } return res.status(403).json({message: "You can not perform this action"})
    
}

module.exports = {handleRegistration, handleActivation, handleLogin, handleRefreshToken, handleLogout, handleForgotPassword, updatePassword, getUsers, deleteUser}