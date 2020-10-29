const User = require('../models/user');
const bcrypt = require('bcrypt');
const crypto=require('crypto');
const mailer=require('./nodemailer')
const saltRounds = 10;

exports.register_page_get = (req, res) => {
    res.render('register', {
        message: "Please enter all the genuine credentials as these will be used to contact you for prize money.",
        isLogged: req.session.isLogged
    });
}

exports.register_user = (req, res) => {
    console.log(req.body);
    User.findOne({ email: req.body.email}, (err, user) => {
        if (err) {
            console.log(err)
            return res.render('register', {
                message: "Some error occured in registration. Please try again later.",
                isLogged: req.session.isLogged
            })
        }
        if (user) {
            return res.render('register', {
                message: "You are already registered with that email.",
                isLogged: req.session.isLogged
            })
        } else {
            bcrypt.hash(req.body.password, saltRounds, function (err, hash) {
                if (err) { return res.render('errorPage', { isLogged: req.session.isLogged })  }
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
                if (err) { return res.render('errorPage', { isLogged: req.session.isLogged })  }
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
        message: "You can change your TT user ID if you faced some issue while registering.",
        isLogged: req.session.isLogged
    });
}

exports.changeUID = (req, res) => {
    User.findById(req.session.user_id,(err,user)=>{
        if (err) { return res.render('errorPage', { isLogged: req.session.isLogged })  }
        user.regno=req.body.UID;
        user.save((err)=>{
            return res.redirect('/home')
        })
    })
}

exports.reset_get=(req,res)=>{
    return res.render('passReset', {
        message: "Please enter your email",
        isLogged: req.session.isLogged
    });
}

exports.reset_password=(req,res)=>{
    if(req.body.email==''){
        return res.redirect('/auth/passReset')
    }
    crypto.randomBytes(32,(err,buffer)=>{
        if (err) { return res.render('errorPage', { isLogged: req.session.isLogged })  }

        const resetToken=buffer.toString('hex')
        User.findOne({email:req.body.email},(err,user)=>{
            if (err) { return res.render('errorPage', { isLogged: req.session.isLogged })  }
            if(!user){
                return res.render('passReset', {
                    message: "No user with that email.",
                    isLogged: req.session.isLogged
                });
            }else{
                console.log(resetToken)
                user.resetToken=resetToken
                user.resetTokenExpiration=Date.now()+(60*60*1000) //temporary token for 1 hour
                user.save((err)=>{
                    if (err) { return res.render('errorPage', { isLogged: req.session.isLogged })  }

                    //send email
                    const mailOptions = {
                        from: "ISTE Manipal | Acumen(ATR) <contactus@istemanipal.com>", // sender address
                        to: req.body.email.toString(),
                        subject: "You requested a password reset for ATR(Amazing Tech Race)", // Subject line
                        html: `<h4>Kindly click on the link provided to reset your password</h4>
                                <a href="http://atr.techtatva.in/auth/newPass/${resetToken}">Reset Password</a>
                                <p>If you didn't request for a password reset don't click on the link and please report this to us. </p>`, // plain text body
                       };
                    mailer.sendMail(mailOptions,(err)=>{
                        if (err) { 
                            console.log(err)
                            return res.render('errorPage', { isLogged: req.session.isLogged }) 
                        }
                        res.redirect('/auth/login')
                    })
                })
            }
        })
    })
}

exports.newPassword_get=(req,res)=>{
    const token=req.params.token;
    User.findOne({resetToken:token, resetTokenExpiration:{$gt: Date.now()}},(err,user)=>{
        if (err || !user) { 
            console.log(err)
            return res.render('errorPage', { isLogged: req.session.isLogged }) 
        }
        return res.render('newPass', {
            message: "Enter a new password to update.",
            isLogged: req.session.isLogged,
            userID:user._id,
            resetToken:token
        });
    })
    
}

exports.newPassword_set=(req,res)=>{
    const token=req.body.resetToken;
    const password=req.body.password;
    const userID=req.body.userID
    User.findOne({resetToken:token, resetTokenExpiration:{$gt: Date.now()}, _id:userID},(err,user)=>{
        if (err || !user) { 
            console.log(err)
            return res.render('errorPage', { isLogged: req.session.isLogged }) 
        }
        bcrypt.hash(password, saltRounds,(err, hash) =>{
           user.password=hash;
           user.resetToken=undefined;
           user.resetTokenExpiration=undefined
           user.save((err)=>{
            if (err) { 
                return res.render('errorPage', { isLogged: req.session.isLogged }) 
            }
            res.redirect('/auth/login')
           })
        });
    })
}