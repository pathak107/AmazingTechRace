const Game = require('../models/games')
const Ques = require('../models/questions')
const User = require('../models/user')


exports.home_landingPage = (req, res) => {
    return res.render('landing', {
        isLogged: req.session.isLogged
    })
}

exports.home_page_get = (req, res) => {
    Game.find((err, games) => {
        if (err) {
            return res.render('errorPage', {
                isLogged: req.session.isLogged
            })
        }
        User.findById(req.session.user_id, (err, user) => {
            if (err) { return res.render('errorPage', { isLogged: req.session.isLogged }) }

            return res.render('home', {
                games: games,
                message: "Choose from the following games.",
                user: user,
                isLogged: req.session.isLogged
            })
        })

    })
}
exports.home_contactUs = (req, res) => {
    return res.render('contact', {
        isLogged: req.session.isLogged
    })
}

exports.home_leaderboard = (req, res) => {
    User.find((err, users) => {
        if (err) console.log(err)

        return res.render('leaderboard', {
            isLogged: req.session.isLogged,
            users:users
        })

    }).sort({ score: 'DESC' })
        .select('name regno score')
}
