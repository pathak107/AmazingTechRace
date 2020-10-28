const mongoose = require('mongoose')
const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        match: /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/
    },
    regno: {
        type: String,
        required: true,
        unique:true
    },
    phNumber: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    skips: {
        type: Number,
        default: 0
    },
    hints: {
        type: Number,
        default: 0,
    },
    score: {
        type: Number,
        default: 0,
    },
    // quesIndex:Number,
    quesIndexInfo: { // a map of values game id and its quesIndex
        type: Array,
    },
    hintUsedQuestions:Array, //ques ids of hints used ques and their index
    solvedQuestions:Array, //ques ids of solved ques
    skippedQuestions:Array,//ques ids of skippped ques
});

const User = mongoose.model('User', UserSchema);
module.exports = User;