const mongose = require('mongoose')

const UserSchema = new mongose.Schema({
    username: {type: String, required: true, minLength: 6, unique: true},

    email: {type: String, required: true, unique: true},

    password: {type: String, required: true},
    
    activationToken: {type: String, default: " "},

    refreshToken: {type: String, default: " "},

    forgotPasswordToken: {type: String, default: " "},

    roles: {user: { type: Number, default: 1000}, admin: Number, editor: Number}
}, {timestamps: true})

module.exports = mongose.model("User", UserSchema)