const {createPost, updatePost, getPost, userPosts, likePost, postLikes, deletePost} = require('../controller/postsController')
const router = require('express').Router()
const verifyJwt = require('../middleware/verifyJwt')


router.post('/post', verifyJwt ,createPost)
router.put('/post/:id', verifyJwt ,updatePost)
router.get('/post/:postId', verifyJwt ,getPost)
router.get('/post',verifyJwt ,userPosts)
router.put('/post/:likePostId', verifyJwt ,likePost)
router.get('/post/likes/:likePostId', verifyJwt, postLikes)
router.delete('/post/delete/:postId', verifyJwt, deletePost)





module.exports = router
