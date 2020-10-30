require('dotenv').config()
const express=require('express');
const compression = require('compression')
const mongoose=require('mongoose')
const session = require('express-session')
const bodyParser = require('body-parser');
const app=express();

const https = require('https');
const fs=require('fs');

//using gzip to reduce body sizes
app.use(compression())

//setting bodyparser
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

//Serving Static files
app.use(express.static('public'));

//Ejs initialization
app.set('view engine', 'ejs');

//Mongoose connection
mongoose.connect(process.env.MONGO_URL, {useNewUrlParser: true,useUnifiedTopology: true,useCreateIndex: true,},()=>{
    console.log("Connected to database");
});

//for storing sessions
const mongoDBStore = require('connect-mongodb-session')(session);
const store = new mongoDBStore({
  uri: process.env.MONGO_URL,
  collection: 'sessions'
})

//session intialization
app.set('trust proxy', 1)
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: store,
  cookie: {
    //todo:remeber to set this to true when in production
    secure: false,
    maxAge:60*60*1000 //1 hour
  }
}))

//importing routes
const routes=require('./routes/routes');
app.use('/',routes);

//404 page
app.use((req, res) => {
    return res.render('404error.ejs',{
      isLogged:req.session.isLogged
    })
  })


var port=process.env.PORT || 443;
// app.listen(port,()=>{
//     console.log("Server started.");
// });



const privateKey= fs.readFileSync('tech-priv.pem');
const certificate = fs.readFileSync('tech-pub.pem')

https.createServer({
  cert:certificate,
  key:privateKey
},app).listen(port);