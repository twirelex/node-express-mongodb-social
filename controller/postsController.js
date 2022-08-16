const Post = require('../model/Post')
const post = require('../model/Post')
const User = require('../model/User')

const createPost = async (req, res) => {
    const desc = req.body.desc
    const currentUser = req.user
    if(!desc) return res.sendStatus(404)
    const foundUser = await User.findOne({email: currentUser.email}).exec() 
    if(!foundUser) return res.sendStatus(401)
    try{
        const newPost = post({
            desc: desc,
            user: foundUser._id
        })

        await newPost.save()

        res.status(200).json(newPost)
    } catch (err) {return res.json(err)}
}

const updatePost = async (req, res) => {
    const desc = req.body.desc
    const postId = req.params.id
    const currentUser = req.user
    if(!desc || !postId) return res.sendStatus(404)
    const foundUser = await post.findOne({_id:  postId}).exec() 
    if(!foundUser || foundUser.user != currentUser.id) return res.sendStatus(405)

    try{
        foundUser.desc = desc
        await foundUser.save()

        res.status(200).json(foundUser)
    } catch (err) { return res.json(err)}
}

const getPost = async (req, res) => {
    const postId = req.params.postId
    const currentUser = req.user
    if(!postId) return res.status(404).json({message: "id not found"})
    const foundUserPost = await post.findOne({_id:  postId}).exec() 

    if(!foundUserPost) return res.sendStatus(405)

    res.status(200).json(foundUserPost.desc)
}

const userPosts = async (req, res) => {
    const currentUser = req.user
    const foundUserPosts = await post.find({user:  currentUser.id}).exec()
    
    if(!foundUserPosts) return res.sendStatus(405)

    res.status(200).json(foundUserPosts)
}

const likePost = async (req, res) => {
    const postId = req.params.likePostId
    const currentUser = req.user
    if(!postId) return res.status(404).json({message: "id not found"})
    const foundUserPost = await post.findOne({_id:  postId}).exec() 
    if(!foundUserPost) return res.sendStatus(405)
    if(foundUserPost.likes.includes(req.user.id)) {
       const newFoundUserPost = foundUserPost.likes.filter(ids => ids != req.user.id)
       foundUserPost.likes = newFoundUserPost
       await foundUserPost.save()
    } else {
        foundUserPost.likes = [...foundUserPost.likes, req.user.id]

        await foundUserPost.save()

        res.sendStatus(200)
    }
}

const postLikes = async (req, res) => {
    const postId = req.params.likePostId
    const currentUser = req.user
    if(!postId) return res.status(404).json({message: "id not found"})
    const foundUserPost = await post.findOne({_id:  postId}).exec()
    if(!foundUserPost) return res.sendStatus(405)

    const likes = foundUserPost.likes.length

    res.status(200).json({likes})
}

const deletePost = async (req, res) => {
    const postId = req.params.postId
    // 2000 represents admin role
    const foundPost = await Post.findOne({_id: postId}).exec()
        if(!foundPost) return res.sendStatus(404)
        if(foundPost.user == req.user.id || Object.values(req.user.roles).includes(2000) ){
        
        await Post.findOneAndDelete({_id: postId})
    
        return res.status(200).json({message: "Post deleted"})
            
        } return res.status(403).json({message: "You can not perform this action"})
}

module.exports = {createPost, updatePost, getPost, userPosts, likePost, postLikes, deletePost}