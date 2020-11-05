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

        var hasNextPage=page < Math.ceil((users.length)/USERS_PER_PAGE)
        users=users.slice((page-1)*USERS_PER_PAGE, (page-1)*USERS_PER_PAGE + USERS_PER_PAGE)
        var rank=[]
        for(let i=(page-1)*USERS_PER_PAGE; i< (page-1)*USERS_PER_PAGE + USERS_PER_PAGE; i++){
            rank.push(i+1);
        }
        return res.render('leaderboard', {
            isLogged: req.session.isLogged,
            users: users,
            ranks:rank,
            currentPage:page,
            hasNextPage: hasNextPage,
            hasPrevPage:(page>1),
            prevPage:(page-1)
        })

    }).sort({ score: 'DESC' })
        .select('name regno score timeTaken')
}
