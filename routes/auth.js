const {handleRegistration, handleActivation, handleLogin, handleRefreshToken, handleLogout, handleForgotPassword, updatePassword, getUsers, deleteUser}= require('../controller/auth')
const verifyAdmin = require('../middleware/verifyAdmin')
const verifyJwt = require('../middleware/verifyJwt')

const router = require('express').Router()





router.post('/auth/register', handleRegistration)
router.post('/auth/activate', handleActivation)
router.put('/auth/login', handleLogin)
router.get('/auth/refresh', handleRefreshToken)
router.get('/logout', handleLogout)
router.post('/forgot-password', handleForgotPassword)
router.put('/update-password', updatePassword)
// 2000 represents admin role
router.get('/auth/users',verifyJwt, verifyAdmin(2000),getUsers)
router.delete('/delete/:userId', verifyJwt, deleteUser)


module.exports = router