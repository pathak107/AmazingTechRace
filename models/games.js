const mongoose=require('mongoose')
const GameSchema = new mongoose.Schema({
    title:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    startTime:{
        type:Date,
        required:true
    },
    endTime:{
        type:Date,
        required:true
    },
    live:{
        type:Boolean,
        default:true
    },
    hints:{ //hints to be alloted to uesr per game
        type:Number,
        required:true
    }
  });

  const Game = mongoose.model('Game', GameSchema);
  module.exports=Game;