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
                worksheet.addRow({ rank: index + 1, TTUID: user.regno, score: user.score, timeTaken: user.timeTaken });
            })

            let fileName = path.join(__dirname, `../public/excelSheets/leaderboard${Date.now().toString()}.csv`);
            workbook.csv.writeFile(fileName).then(() => {
                console.log("excel file created")
                res.download(fileName)
            });

        })
            .select('regno score timeTaken')
    });
}