const Ques = require('../models/questions');
const User = require('../models/user')
const Excel = require('exceljs')
var path = require('path');
const fs = require('fs');

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

        users.sort((a, b) => {
            if (a.score != b.score) {
                return b.score - a.score
            } else {
                return a.timeTaken - b.timeTaken
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


exports.admin_editQues_get = (req, res) => {
    const quesID = req.params.quesID;
    Ques.findById(quesID, (err, ques) => {
        if (err) {
            console.log(err)
            return;
        }

        return res.render('adminEditQues', {
            message: "Edit the question",
            adminLoggedIn: req.session.adminLoggedIn,
            ques: ques
        })
    })
}

exports.admin_editQues = (req, res) => {
    var hints = []
    if (req.body.hint1 !== '') {
        hints.push(req.body.hint1)
    }
    if (req.body.hint2 !== '') {
        hints.push(req.body.hint2)
    }
    Ques.findById(req.body.quesID, (err, ques) => {

        ques.question = req.body.question;
        ques.answer = req.body.answer;
        ques.hints = hints;

        ques.save((err, newQues) => {
            if (err) {
                console.log(err);
            }
            res.redirect('/admin/createQues')
        })

    })
}


exports.create_Leaderboard_Excel = (req, res) => {
    const directory = path.join(__dirname, `../public/excelSheets`);

    fs.readdir(directory, (err, files) => {
        if (err) throw err;

        for (const file of files) {
            console.log(file);
            fs.unlink(path.join(directory, file), err => {
                if (err) throw err;
            });
        }


        let workbook = new Excel.Workbook()
        let worksheet = workbook.addWorksheet('leaderboard')
        worksheet.columns = [
            { header: 'Rank', key: 'rank' },
            { header: 'TT UserID', key: 'TTUID' },
            { header: 'Score', key: 'score' },
            { header: 'Time Taken', key: 'timeTaken' },
            { header: 'Email', key: 'email' },
            { header: 'Phone Number', key: 'phNumber' },
        ]

        User.find((err, users) => {
            if (err) console.log(err)

            users.sort((a, b) => {
                if (a.score != b.score) {
                    return b.score - a.score
                } else {
                    return a.timeTaken - b.timeTaken
                }
            });

            users.forEach((user, index) => {
                worksheet.addRow({
                    rank: index + 1,
                    TTUID: user.regno, 
                    score: user.score, 
                    timeTaken: user.timeTaken,
                    email:user.email,
                    phNumber:user.phNumber 
                });
            })

            let fileName = path.join(__dirname, `../public/excelSheets/leaderboard${Date.now().toString()}.csv`);
            workbook.csv.writeFile(fileName).then(() => {
                console.log("excel file created")
                res.download(fileName)
            });

        })
            .select('regno score timeTaken email phNumber')
    });
}



var top50Players=[
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
exports.create_finalLead_Excel = (req, res) => {
    const directory = path.join(__dirname, `../public/excelSheets`);

    fs.readdir(directory, (err, files) => {
        if (err) throw err;

        for (const file of files) {
            console.log(file);
            fs.unlink(path.join(directory, file), err => {
                if (err) throw err;
            });
        }


        let workbook = new Excel.Workbook()
        let worksheet = workbook.addWorksheet('leaderboard')
        worksheet.columns = [
            { header: 'Rank', key: 'rank' },
            { header: 'TT UserID', key: 'TTUID' },
            { header: 'Score', key: 'score' },
            { header: 'Time Taken', key: 'timeTaken' },
        ]

        User.find({ regno: { $in: top50Players } },(err, users) => {
            if (err) console.log(err)

            users.sort((a, b) => {
                if (a.score != b.score) {
                    return b.score - a.score
                } else {
                    return a.timeTaken - b.timeTaken
                }
            });
            users.forEach((user, index) => {
                worksheet.addRow({ rank: index + 1, TTUID: user.regno, score: user.score, timeTaken: user.timeTaken });
            })

            let fileName = path.join(__dirname, `../public/excelSheets/finalLead${Date.now().toString()}.csv`);
            workbook.csv.writeFile(fileName).then(() => {
                console.log("excel file created")
                res.download(fileName)
            });

        })
            .select('regno score timeTaken')
    });
}


exports.admin_setTopScoresTo0=(req,res)=>{
    User.updateMany({ regno:{ $in: top50Players }},{ $set : {hints:3,skips:2}},(err,users)=>{
        if(err) console.log(err)

        console.log(users);
        res.redirect('/admin/leaderboard')
    })
}