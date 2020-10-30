module.exports = (req, res, next) => {
    if((req.session.isLogged!=null ||req.session.isLogged!=undefined)&&req.session.isLogged==true){
        next()
    }
    else{
        res.redirect('/auth/login');
    }
}