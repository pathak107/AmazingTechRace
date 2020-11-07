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
        if (err) { return res.render('errorPage', { isLogged: req.session.isLogged }) }

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

const USERS_PER_PAGE = 50;
exports.home_leaderboard = (req, res) => {
    let page = +req.query.page || 1;
    User.find((err, users) => {
        if (err) { return res.render('errorPage', { isLogged: req.session.isLogged }) }

        users.sort((a, b) => {
            if (a.score != b.score) {
                return b.score - a.score
            } else {
                return a.timeTaken - b.timeTaken
            }
        });

        var hasNextPage = page < Math.ceil((users.length) / USERS_PER_PAGE)
        users = users.slice((page - 1) * USERS_PER_PAGE, (page - 1) * USERS_PER_PAGE + USERS_PER_PAGE)
        var rank = []
        for (let i = (page - 1) * USERS_PER_PAGE; i < (page - 1) * USERS_PER_PAGE + USERS_PER_PAGE; i++) {
            rank.push(i + 1);
        }
        return res.render('leaderboard', {
            isLogged: req.session.isLogged,
            users: users,
            ranks: rank,
            currentPage: page,
            hasNextPage: hasNextPage,
            hasPrevPage: (page > 1),
            prevPage: (page - 1)
        })

    }).sort({ score: 'DESC' })
        .select('name regno score timeTaken')
}


var top50Players = [
    '8299',
    '8316',
    '6905',
    '7666',
    '6149',
    '6593',
    '7611',
    '5520',
    '6718',
    '5556',
    '5506',
    '5672',
    '8008',
    '7648',
    '7681',
    '6474',
    '5208',
    '7520',
    '5180',
    '5759',
    '7682',
    '7989',
    '5037',
    '7776',
    '8351',
    '8216',
    '5233',
    '7079',
    '5019',
    '8296',
    '6942',
    '7521',
    '3659',
    '7073',
    '6325',
    '5110',
    '6946',
    '5324',
    '7046',
    '5354',
    '8095',
    '8241',
    '8172',
    '6810',
    '5038',
    '5522',
    '5714',
    '5636',
    '6686',
    '5446',
]

exports.home_finalLead = (req, res) => {
    User.find({ regno: { $in: top50Players } }, (err, users) => {
        if (err) { return res.render('errorPage', { isLogged: req.session.isLogged }) }

        users.sort((a, b) => {
            if (a.score != b.score) {
                return b.score - a.score
            } else {
                return a.timeTaken - b.timeTaken
            }
        });
        return res.render('finalLead', {
            isLogged: req.session.isLogged,
            users: users,
        })

    }).sort({ score: 'DESC' })
        .select('name regno score timeTaken timestamp')
}
