const router = require('express').Router()
const verifyJwt = require('../middleware/verifyJwt')
const {postBio, editBio, getBio, timeline, follow, unfollow} = require('../controller/profileController')



router.post('/profile/bio',verifyJwt ,postBio)
router.put('/profile/bio/:id',verifyJwt ,editBio)
router.get('/profile/bio/:profileId', verifyJwt, getBio)
router.get('/user/timeline', verifyJwt, timeline)
router.get('/user/:id/follow', verifyJwt, follow)
router.get('/user/:id/unfollow', verifyJwt, unfollow)


module.exports = router

