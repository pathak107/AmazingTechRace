const express = require('express')
const router = express.Router()

//importing controllers
const authController=require('../controllers/authController')
const homeController=require('../controllers/homeController')
const adminController=require('../controllers/adminController')
const gameController=require('../controllers/gameController')

//importing middlewares
const adminAuthCheck=require('../middlewares/adminAuthCheck')
const checkAuth=require('../middlewares/checkAuth')

//auth routes
router.get('/auth/login',authController.login_page_get);
router.get('/auth/register',authController.register_page_get)
router.get('/auth/logout',authController.logout_user)
router.post('/auth/login',authController.login_user)
router.post('/auth/register',authController.register_user)
router.get('/auth/changeUID',checkAuth,authController.changeUID_get)
router.post('/auth/changeUID',checkAuth,authController.changeUID)
router.get('/auth/passReset',authController.reset_get)
router.post('/auth/passReset',authController.reset_password)
router.get('/auth/newPass/:token',authController.newPassword_get);
router.post('/auth/newPass',authController.newPassword_set)

//admin routes
router.get('/admin/login',adminController.admin_login_get)
router.get('/admin/logout',adminController.admin_logout)
router.post('/admin/login',adminController.admin_login)
router.get('/admin/leaderboard',adminAuthCheck,adminController.admin_leaderboard)
router.get('/admin/createGame',adminAuthCheck,gameController.game_create_get)
router.post('/admin/createGame',adminAuthCheck,gameController.game_create)
router.get('/admin/deleteGame/:gameID',adminAuthCheck,gameController.game_delete)
router.get('/admin/createQues',adminAuthCheck,gameController.game_createQues_get)
router.post('/admin/createQues',adminAuthCheck,gameController.game_createQues)
router.get('/admin/editQues/:quesID',adminAuthCheck,adminController.admin_editQues_get)
router.post('/admin/editQues',adminAuthCheck,adminController.admin_editQues)
router.get('/admin/leaderboardDownload',adminAuthCheck,adminController.create_Leaderboard_Excel);

// //home related routes
router.get('/',homeController.home_landingPage);
router.get('/home',checkAuth,homeController.home_page_get);
router.get('/home/contact',homeController.home_contactUs);
router.get('/home/leaderboard',homeController.home_leaderboard);


router.get('/game/start/:gameID',checkAuth,gameController.game_start)
router.get('/game/play',checkAuth,gameController.game_play);
router.post('/game/answerCheck',checkAuth,gameController.game_answerCheck)
router.get('/game/quesSkip',checkAuth,gameController.game_skipQues)
router.get('/game/buyHint',checkAuth,gameController.game_buyHints)
router.get('/game/showHint/:quesID',checkAuth,gameController.game_showHints);
router.get('/game/useHint/:quesID',checkAuth,gameController.game_useHints)
// router.get('/home/leaderboard')
// router.get('/home/instructions')

// //game related routes like hint, skip, check ans etc
// router.get('/game/submit',gameController)
// router.get('/game/hint',gameController)
// router.get('/game/skip',gameController)

module.exports = router;