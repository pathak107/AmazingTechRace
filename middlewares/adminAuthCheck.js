module.exports = (req, res, next) => {
    if((req.session.adminLoggedIn!=null ||req.session.adminLoggedIn!=undefined)&&req.session.adminLoggedIn==true){
        console.log('logged in');
        next()
    }
    else{
        res.redirect('/admin/login');
    }
}