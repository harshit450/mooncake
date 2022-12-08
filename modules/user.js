const mongoose = require('mongoose')
const Schema = mongoose.Schema


const userSchema =new Schema( {
    email:String, 
    name:String,
    phoneno:String,
    password:String,
    companyName:String,
    details:String,
    ordered:String,
  })
  
module.exports = mongoose.model('User', userSchema)