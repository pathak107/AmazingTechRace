const mongoose=require('mongoose')
const QuesSchema = new mongoose.Schema({
    question:{
        type:String,
        required:true
    },
    answer:{
        type:String,
        required:true
    },
    quesIndexInfo:{
        type:Number,
        required:true,
    },
    hints:{
        type:Array,
    },
    gameID:{
        type: mongoose.Types.ObjectId,
    }
  });

  const Ques = mongoose.model('Ques', QuesSchema);
  module.exports=Ques;