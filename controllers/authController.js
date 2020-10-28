const User = require('../models/user');
const bcrypt = require('bcrypt');
const saltRounds = 10;

exports.register_page_get = (req, res) => {
    res.render('register', {
        message: "Please enter all the genuine credentials as these will be used to contact you for prize money.",
        isLogged: req.session.isLogged
    });
}

exports.register_user = (req, res) => {
    console.log(req.body);
    User.findOne({ $or: [{ email: req.body.email }, { regno: req.body.regno }] }, (err, user) => {
        if (err) {
            console.log(err)
            return res.render('register', {
                message: "Some error occured in registration. Please try again later.",
                isLogged: req.session.isLogged
            })
        }
        if (user) {
            return res.render('register', {
                message: "You are already registered with that email and registration number.",
                isLogged: req.session.isLogged
            })
        } else {
            bcrypt.hash(req.body.password, saltRounds, function (err, hash) {
                const newUser = new User({
                    name: req.body.name,
                    email: req.body.email,
                    regno: req.body.regno,
                    phNumber: req.body.phNumber,
                    password: hash
                })
                newUser.save((err, newUser) => {
                    if (err) {
                        console.log(err)
                        return res.render('register', {
                            message: "Some error occured in registration. Please try again later.",
                            isLogged: req.session.isLogged
                        })
                    }

                    //new user created
                    req.session.user_id = newUser._id;
                    req.session.isLogged = true;

                    res.redirect('/home')
                })
            });
        }
    })
}

exports.login_page_get = (req, res) => {
    res.render('login', {
        message: "Enter details to login.",
        isLogged: req.session.isLogged
    });
}

exports.login_user = (req, res) => {
    console.log(req.body);
    User.findOne({ email: req.body.email }, (err, user) => {
        if (err) {
            console.log(err)
            return res.render('login', {
                message: "Some error occured in login. Please try again later.",
                isLogged: req.session.isLogged
            })
        }
        if (!user) {
            return res.render('login', {
                message: "There is no user with that email.",
                isLogged: req.session.isLogged
            })
        } else {
            bcrypt.compare(req.body.password, user.password, function (err, result) {
                if (result == true) {
                    //user authenticated
                    req.session.user_id = user._id;
                    req.session.isLogged = true

                    res.redirect('/home');

                }
                else {
                    return res.render('login', {
                        message: "Email or password entered is incorrect.",
                        isLogged: req.session.isLogged
                    })
                }
            });

        }
    })
}

exports.logout_user = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.render('errorPage', {
                isLogged: req.session.isLogged
            })
        };
        res.redirect('/');
    })
}


exports.changeUID_get = (req, res) => {
    res.render('changeUserID', {
        message: "You can change you TT user ID if you faced some issue while registering.",
        isLogged: req.session.isLogged
    });
}

exports.changeUID = (req, res) => {
    User.findById(req.session.user_id,(err,user)=>{
        user.regno=req.body.UID;
        user.save((err)=>{
            return res.redirect('/home')
        })
    })
}
