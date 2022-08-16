const mongose = require('mongoose')

const profile = new mongose.Schema({
    user: {
        type: mongose.Schema.Types.ObjectId,
        ref: 'User'
    },
    picture: {type: String, default: ""},
    bio: {type: String, maxLength: 30, default: ""},
    timeline: {type: Array, default: []},
    followers: {type: Array, default: []},
    following: {type: Array, default: []}
}, {timestamps: true})


module.exports = mongose.model("UserProfile", profile)