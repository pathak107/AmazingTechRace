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
    hintUsedQuestions:Array, // {{gameID : 512123,hintIndex:{0,1}}  game id with index of hints used
    timestamp:Date
});

const User = mongoose.model('User', UserSchema);
module.exports = User;

//for ints used ques
// {   
//     {   quesID : 512123,
//         hintIndex:[0,1]
//     },
//     {   quesID : 512123,
//         hintIndex:[0,1],
//     }

// }