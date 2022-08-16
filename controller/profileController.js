const profile = require('../model/UserProfile')
const post = require('../model/Post')
const postBio = async (req, res) => {
    const currentUser = req.user
    const bio = req.body.bio

    if(!bio) return res.status(404)
    const foundUser = await profile.findOne({user:  currentUser.id}).exec() 
    if(!foundUser) return res.sendStatus(404)
    try{
        foundUser.bio = bio
        await foundUser.save()
        res.status(200).json(foundUser)
    } catch (err) {res.status(400).json({message: "something went wrong"})}
}

const editBio = async (req, res) => {
    const currentUser = req.user
    const id = req.params.id
    const bio = req.body.bio
    if(!bio) return res.status(404)
    const foundUser = await profile.findOne({_id: id}).exec()

    //console.log(`${currentUser.id}` === `${foundUser.user}`)

    if(!foundUser) return res.status(403).json({message: "you do not access access"})
    if(currentUser.id != foundUser.user) return res.status(403).json({message: "you do not access access"})
    
    try {
        foundUser.bio = bio
        await foundUser.save()

        res.status(200).json(foundUser)
    }catch (err) {res.status(400).json({message: "something went wrong"})}
}

const getBio = async (req, res) => {
    const id = req.params.profileId
    if(!id) return res.status(404)
    const foundUser = await profile.findOne({_id: id})

    if(!foundUser) return res.status(404).json({message: "No user profile found"})

    res.status(200).json(foundUser.bio)
}

//Display all user post along with the user's followings post (Sorted)
const timeline = async (req, res) => {
    const currentUser = req.user
    const foundUserPosts = await post.find({user: currentUser.id}).exec()
    const foundUser = await profile.findOne({user: currentUser.id}).exec()
    if(!foundUser || !foundUserPosts) res.status(404).json({message: "No user post found"})
    const friendsPost = foundUser.following.map(result=> result)

    const posted = await post.find({user: Object.values(friendsPost)}).exec()

    const timelinePosts = foundUserPosts.concat(posted)
    const sorted = timelinePosts.sort( (a, b) => {
      return  Number(a.createdAt) - Number(b.createdAt)
    } )
    res.status(200).json(sorted)
    
}

const follow = async (req, res) => {
    
    const userId  = req.params.id
    const currentUser = req.user
    if(!userId) return res.status(404).json({message: "id not found"})
    if (currentUser.id === userId) return res.status(500).json({message: "you cannot follow yourself"})
    const foundUserProfile = await profile.findOne({user:  userId}).exec()
    const currentUserProfile = await profile.findOne({user: currentUser.id}).exec()
    if(!foundUserProfile.followers.includes(currentUser.id)) {
        foundUserProfile.followers = [...foundUserProfile.followers, currentUser.id]
        currentUserProfile.following = [...currentUserProfile.following, foundUserProfile.user.toString()]
       await foundUserProfile.save()
       await currentUserProfile.save()

       res.status(200).json({message: `you now follow ${foundUserProfile.user}`})
    } else {
        res.status(200).json({message: "You already follow this user"})
    }
}

const unfollow = async (req, res) => {
    const userId  = req.params.id
    const currentUser = req.user
    if(!userId) return res.status(404).json({message: "id not found"})
    if (currentUser.id === userId) return res.status(500).json({message: "you cannot unfollow yourself"})
    const foundUserProfile = await profile.findOne({user:  userId}).exec()
    const currentUserProfile = await profile.findOne({user: currentUser.id}).exec()
    if(foundUserProfile.followers.includes(currentUser.id)) {
        foundUserProfile.followers = foundUserProfile.followers.filter(followerz => followerz != currentUser.id)
        currentUserProfile.following = currentUserProfile.following.filter(followingz => followingz != foundUserProfile.user)
       await foundUserProfile.save()
       await currentUserProfile.save()

       res.status(200).json({message: `you have unfollowed ${foundUserProfile.user}`})
    } else {
        res.status(200).json({message: "You do not follow this user"})
    }
}

module.exports = {postBio, editBio, getBio, timeline, follow, unfollow}