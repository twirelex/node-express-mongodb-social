const mongose = require('mongoose')

const post = new mongose.Schema({
    desc: {type: String, minLength: 1, maxLength: 300},
    picture: {type: String, default:""},
    user: {
        type: mongose.Schema.Types.ObjectId,
        ref: 'User'
    },
    likes: {type: Array, default: []}

}, {timestamps: true})


module.exports = mongose.model("Post", post)