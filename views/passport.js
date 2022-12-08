const Localstrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt')
const User = require('../modules/user')

function init(passport){
  passport.use(new Localstrategy({ usernameField: 'email'},async (email,password,done)=>{
   const user = await User.findOne({email:email})
   if(!user){
    return done(null,false,{ message: "No User with this Email ID!"})
   }
   
   bcrypt.compare(password,user.password).then(match=>{
    if(match){
      return done(null, user, {message:'Login Success!'} )
    }
    return done(null,false,{ message: "Username or Password is Wrong!"})
  }).catch(err=>{
    return done(null,false,{message:'Something went wrong'})
   })
  
}))

  passport.serializeUser((user, done)=>{
    done(null,user._id)
  })
  
  passport.deserializeUser((id,done)=>{
    User.findById(id,(err,user)=>{
    done(err,user)
    })
  })

}


module.exports = init