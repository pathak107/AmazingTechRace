exports.admin_login_get=(req,res)=>{
    res.render('adminLogin',{
        message:"Enter details to login.",
        adminLoggedIn:req.session.adminLoggedIn
    });
}
exports.admin_login=(req,res)=>{
    if(req.body.username==process.env.ADMIN_USERNAME && req.body.password==process.env.ADMIN_PASSWORD){
        //admin should be logged
        req.session.adminLoggedIn=true
        return res.redirect('/admin/createGame')
    }
    else{
        res.render('adminLogin',{
            message:"Username or password entered is incorrect.",
            adminLoggedIn:req.session.adminLoggedIn
        })
    }
}

exports.admin_logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) console.log(err);
        console.log('logged out');
        res.redirect('/admin/login');
    })
}