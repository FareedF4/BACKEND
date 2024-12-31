const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/miniprojectdetails');

const userschema = mongoose.Schema({
    username :String,
    name:String,
    age: Number,
    email:String,
    password:String,
    posts : [
        {type:mongoose.Schema.Types.ObjectId,ref:"post"}
    ]
})

module.exports = mongoose.model("userModel",userschema);