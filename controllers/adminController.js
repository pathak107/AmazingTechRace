const User=require('../models/user')
exports.admin_login_get = (req, res) => {
    res.render('adminLogin', {
        message: "Enter details to login.",
        adminLoggedIn: req.session.adminLoggedIn
    });
}
exports.admin_login = (req, res) => {
    if (req.body.username == process.env.ADMIN_USERNAME && req.body.password == process.env.ADMIN_PASSWORD) {
        //admin should be logged
        req.session.adminLoggedIn = true
        return res.redirect('/admin/createGame')
    }
    else {
        res.render('adminLogin', {
            message: "Username or password entered is incorrect.",
            adminLoggedIn: req.session.adminLoggedIn
        })
    }
}

exports.admin_leaderboard = (req, res) => {
    User.find((err, users) => {
        if (err) console.log(err)

        users.sort((a, b)=>{
            if(a.score!=b.score){
                return b.score-a.score
            }else{
                return a.timeTaken-b.timeTaken
            }
        });
        return res.render('adminLeaderboard', {
            adminLoggedIn: req.session.adminLoggedIn,
            users: users
        })

    })
        .select('name regno score email phNumber timeTaken')
}

exports.admin_logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) console.log(err);
        res.redirect('/admin/login');
    })
}