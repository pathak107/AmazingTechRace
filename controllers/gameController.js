const Game = require('../models/games')
const Ques = require('../models/questions')
const User = require('../models/user')
const { use } = require('../routes/routes')
exports.game_create_get = (req, res) => {
    Game.find((err, games) => {
        return res.render('adminCreate',
            {
                message: "Enter details to create game.",
                games: games,
                adminLoggedIn: req.session.adminLoggedIn
            })
    })
}

exports.game_create = (req, res) => {
    const newGame = new Game({
        title: req.body.title,
        description: req.body.description,
        hints: req.body.hints,
        startTime: Date.parse(req.body.startTime),
        endTime: Date.parse(req.body.endTime)
    })
    newGame.save((err) => {
        if (err) {
            return res.render('adminCreate', {
                message: "Some error occured in creating the game. Please check all the fields entered carefully.",
                adminLoggedIn: req.session.adminLoggedIn
            })
        }
        return res.redirect('/admin/createGame')
    })
}

exports.game_delete = (req, res) => {
    const gameID = req.params.gameID;
    Game.findById(gameID, (err, game) => {
        game.remove((err) => {
            if (err) {
                console.log(err);
            }
            else {
                return res.redirect('/admin/createGame')
            }
        })
    })
}

exports.game_createQues_get = (req, res) => {
    Game.find((err, games) => {
        if (err) {
            return res.render('adminCreateQues', {
                message: "Some error occured in loading all games. Please try again later.",
                games: [],
                questions: [],
                adminLoggedIn: req.session.adminLoggedIn
            })
        }
        if (games.length == 0) {
            return res.render('adminCreateQues', {
                message: "There are no games created.",
                games: games,
                questions: [],
                adminLoggedIn: req.session.adminLoggedIn
            })
        } else {
            var quesInfo = [];
            var quesPerGame = [];
            Ques.find((err, ques) => {
                for (let i = 0; i < games.length; i++) {
                    quesPerGame = [];
                    for (let j = 0; j < ques.length; j++) {
                        if (ques[j].gameID.toString() == games[i]._id.toString()) {
                            quesPerGame.push(ques[j]);
                        }
                    }
                    quesInfo.push({
                        game: games[i].title,
                        questions: quesPerGame
                    })
                }
                return res.render('adminCreateQues', {
                    message: "Choose which game this question belongs to.",
                    games: games,
                    questions: quesInfo,
                    adminLoggedIn: req.session.adminLoggedIn
                })
            })
        }
    })
}

exports.game_createQues = (req, res) => {
    var hints = []
    if (req.body.hint1 !== '') {
        hints.push(req.body.hint1)
    }
    if (req.body.hint2 !== '') {
        hints.push(req.body.hint2)
    }
    console.log(hints)
    Ques.find({ gameID: req.body.gameID }).countDocuments((err, totalQuesOfThisGame) => {
        const newQues = new Ques({
            question: req.body.question,
            answer: req.body.answer,
            quesIndexInfo: totalQuesOfThisGame + 1,
            hints: hints,
            gameID: req.body.gameID
        })
        newQues.save((err, newQues) => {
            if (err) {
                console.log(err);
            }
            res.redirect('/admin/createQues')
        })
    })
}

exports.game_start = (req, res) => {
    const gameID = req.params.gameID;
    const currTime = Date.now()
    Game.findById(gameID, (err, game) => {
        if (err) console.log(err)
        if (game.startTime <= currTime && game.endTime >= currTime) {
            console.log("Start the game")
            req.session.gameID = gameID;
            User.findById(req.session.user_id, (err, user) => {
                if (err) console.log(err)
                //search whether user has already played the game
                //if true simply use the ques index already in use
                //if false make a new ques info contining ques index of game as 1
                var hasPlayed = false;
                for (let i = 0; i < user.quesIndexInfo.length; i++) {
                    if (user.quesIndexInfo[i].gameID == gameID) {
                        hasPlayed = true
                        break;
                    }
                }
                if (!hasPlayed) {
                    //todo: update hints and skips based on game
                    user.hints=user.hints+2;
                    user.skips=user.skips+3;

                    //saving the timestamp
                    user.timestamp=Date.now()
                    console.log(user.timestamp)
                    user.quesIndexInfo.push({
                        gameID: gameID,
                        quesIndex: 1
                    })
                }
                user.save((err, user) => {
                    if (err) console.log(err)
                    res.redirect('/game/play')
                })

            })

        } else if (game.startTime > currTime) {
            console.log("Game hasn't started yet")
            Game.find((err, games) => {
                User.findById(req.session.user_id, (err, user) => {
                    if (err) { return res.render('errorPage', { isLogged: req.session.isLogged }) }
        
                    return res.render('home', {
                        games: games,
                        message: "This game isn't live yet.",
                        user: user,
                        isLogged: req.session.isLogged
                    })
                })
        
            })

        }
        else {
            Game.find((err, games) => {
                User.findById(req.session.user_id, (err, user) => {
                    if (err) { return res.render('errorPage', { isLogged: req.session.isLogged }) }
        
                    return res.render('home', {
                        games: games,
                        message: "This game is already finished.",
                        user: user,
                        isLogged: req.session.isLogged
                    })
                })
        
            })

        }
    })
}

exports.game_play = (req, res) => {

    const gameID = req.session.gameID
    User.findById(req.session.user_id, async (err, user) => {
        if (err) console.log(err)

        //seraching ques index
        var quesIndex
        for (let i = 0; i < user.quesIndexInfo.length; i++) {
            if (user.quesIndexInfo[i].gameID == gameID) {
                quesIndex = user.quesIndexInfo[i].quesIndex
                break;
            }
        }
        var totalQuesOfThisGame = 0;
        await Ques.countDocuments({ gameID: gameID }, (err, docs) => {
            if (err) { return res.reder('errorPage', { isLogged: req.session.isLogged }) }
            totalQuesOfThisGame = docs;
        })

        Ques.findOne({ $and: [{ gameID: gameID }, { quesIndexInfo: quesIndex }] }, (err, ques) => {
            if ((ques == null || ques == undefined) && quesIndex <= totalQuesOfThisGame) {
                if (err) { return res.reder('errorPage', { isLogged: req.session.isLogged }) }
            }
            if (ques == null && quesIndex > totalQuesOfThisGame) {
                Game.findById(gameID, (err, game) => {
                    return res.render('gameover', {
                        isLogged: req.session.isLogged,
                        gameTitle: game.title
                    })
                }).select('title')
            } else {
                return res.render('gameplay', {
                    ques: ques,
                    message: "Type your answer in the text field.",
                    user: user,
                    isLogged: req.session.isLogged
                })
            }
        })
    })
}

exports.game_answerCheck = (req, res) => {
    const quesID = req.body.quesID
    const ans = req.body.ans
    const gameID = req.session.gameID

    Ques.findById(quesID, (err, ques) => {
        if (err){return res.json({
            success:false,
            answer: null,
            error:err
        })}

        if (ans.toUpperCase().replace(/\s+/g, '') == ques.answer.toUpperCase().replace(/\s+/g, '')) {
            console.log('correct')
            User.findById(req.session.user_id, (err, user) => {
                if (err){return res.json({
                    success:false,
                    answer: null,
                    error:err
                })}
                //seraching
                for (let i = 0; i < user.quesIndexInfo.length; i++) {
                    if (user.quesIndexInfo[i].gameID == gameID) {
                        user.quesIndexInfo[i].quesIndex = user.quesIndexInfo[i].quesIndex + 1;
                        user.markModified('quesIndexInfo')
                    }
                }

                //calulate the difference in time for solving this question and also update
                //the timestamp for next question
                var timeDiff;
                if(Date.now() - (new Date(user.timestamp)) > 0){
                    timeDiff= Date.now() - (new Date(user.timestamp));
                }
                
                //inverse bcoz more the time taken lesser should be the score
                //5* bcoz we're assumin for 5 days
                user.timeTaken += Math.ceil(timeDiff/1000); //time taken is seconds
                user.score+= 5;
                user.timestamp=Date.now()
                user.save((err) => {
                    if (err){return res.json({
                        success:false,
                        answer: null,
                        error:err
                    })}
                    return res.json({
                        success:true,
                        answer: 'correct',
                        error:null
                    })
                })
            })
        }
        else {
            console.log("incorrect")
            return res.json({
                success:true,
                answer: 'incorrect',
                error:null
            })
        }
    })
}


exports.game_skipQues = (req, res) => {
    const gameID = req.session.gameID
    User.findById(req.session.user_id, (err, user) => {
        if (err) console.log(err)

        if (user.skips > 0) {
            //seraching
            for (let i = 0; i < user.quesIndexInfo.length; i++) {
                if (user.quesIndexInfo[i].gameID == gameID) {
                    user.quesIndexInfo[i].quesIndex = user.quesIndexInfo[i].quesIndex + 1;
                    user.markModified('quesIndexInfo')
                }
            }
            user.skips -= 1;
            user.save((err) => {
                if (err) console.log(err)
                return res.redirect('/game/play')
            })
        }
        else {
            console.log("no skips left")
            return res.redirect('/game/play')
        }
    })
}

//a dropdown will be there which will show how many hints are there to this question sent from game/play route
//so no extra route needs to be made

//show hint route
//if(user.hintQues) contains then show the hint and do not decrement score
//else show hint and user.hintQues should be updated and score-=2
exports.game_showHints = (req, res) => {
    const quesID = req.params.quesID;
    User.findById(req.session.user_id, (err, user) => {
        if (err) {
            return res.json({
                success: false,
                hints: hints,
                error: err
            })
        }

        //serarch for quesID and hint index
        var hintIndexArray;
        var hints = [];
        for (let i = 0; i < user.hintUsedQuestions.length; i++) {
            if (quesID == user.hintUsedQuestions[i].quesID) {
                if (user.hintUsedQuestions[i].hintIndex != null && user.hintUsedQuestions[i].hintIndex.length > 0) {
                    hintIndexArray = user.hintUsedQuestions[i].hintIndex;
                }
            }
        }
        if (hintIndexArray == null) {
            Ques.findById(quesID, (err, ques) => {
                console.log('Tell user he has not used any hint for this question before')
                return res.json({
                    success: true,
                    hints: hints,
                    hintsIndexArray: [],
                    error: null,
                    totalHints: ques.hints.length,
                    userHints:user.hints
                })
            })

        } else {
            Ques.findById(quesID, (err, ques) => {
                if (err) {
                    return res.json({
                        success: false,
                        hints: hints,
                        error: err
                    })
                }

                for (let i = 0; i < hintIndexArray.length; i++) {
                    hints.push(ques.hints[i])
                }

                console.log(hints)
                console.log(hintIndexArray)
                return res.json({
                    success: true,
                    hints: hints,
                    error: null,
                    totalHints: ques.hints.length,
                    hintsIndexArray: hintIndexArray,
                    userHints:user.hints
                })
            })
        }
    })

}

exports.game_useHints = (req, res) => {
    const quesID = req.params.quesID;
    User.findById(req.session.user_id, (err, user) => {
        if (err) {
            return res.json({
                success: false,
                error: err
            })
        }

        //serarch for quesID and hint index
        var hintIndexArray = [];
        var totalHintIndexes = []
        for (let i = 0; i < user.hintUsedQuestions.length; i++) {
            if (quesID == user.hintUsedQuestions[i].quesID) {
                if (user.hintUsedQuestions[i].hintIndex != null && user.hintUsedQuestions[i].hintIndex.length > 0) {
                    hintIndexArray = user.hintUsedQuestions[i].hintIndex;
                }
            }
        }
        //at this point hintIndexArray can be [], [0] or [0,1]
        console.log(hintIndexArray)
        Ques.findById(quesID, (err, ques) => {
            if (err) {
                return res.json({
                    success: false,
                    error: err
                })
            }

            for (let i = 0; i < ques.hints.length; i++) {
                totalHintIndexes.push(i);
            }
            console.log(totalHintIndexes);
            var hintNotUsedIndex = []
            totalHintIndexes.filter((value) => {
                console.log(!hintIndexArray.includes(value))
                if (!hintIndexArray.includes(value)) {
                    hintNotUsedIndex.push(value)
                }
            })
            console.log(hintNotUsedIndex)
            if (hintNotUsedIndex.length > 0) {
                var hintAlreadyUsedForThisQues = false;
                for (let i = 0; i < user.hintUsedQuestions.length; i++) {
                    if (quesID == user.hintUsedQuestions[i].quesID) {
                        //If user has already used a hint of this question
                        hintAlreadyUsedForThisQues = true;
                        user.hintUsedQuestions[i].hintIndex.push(hintNotUsedIndex[0]);
                    }
                }
                if (!hintAlreadyUsedForThisQues) {
                    //user is using hint of this question for the first time
                    user.hintUsedQuestions.push(
                        {
                            quesID: quesID,
                            hintIndex: [hintNotUsedIndex[0]]
                        }
                    )
                }
                user.markModified('hintUsedQuestions')
                user.hints = user.hints - 1;
                user.score = user.score - 2;
                user.save((err) => {
                    return res.json({
                        success: true,
                        error: null
                    })
                })
            }
        })

    })
}


exports.game_buyHints = (req, res) => {
    User.findById(req.session.user_id, (err, user) => {
        if (err) { return res.render('errorPage', { isLogged: req.session.isLogged }) }
        if (user) {
            if (user.score > 2) {
                user.score = user.score - 2;
                user.hints = user.hints + 1;
                user.save((err) => {
                    if (err) { return res.render('errorPage', { isLogged: req.session.isLogged }) }
                    res.redirect('/game/play')
                })
            }
        }
    })
}
