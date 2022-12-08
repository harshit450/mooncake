const express = require('express');
const lodash = require('lodash');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const multer = require("multer");
const app = express();
const nodemail = require('nodemailer');
const open = require('open');
const fileUpload = require('express-fileupload');
const fs = require('fs');
const router = express.Router();
const mongodb= require('mongodb');
const mongoClient = mongodb.MongoClient
const binary = mongodb.Binary;
const session = require('express-session')
const flash = require('express-flash')
const MongoDBStore = require('connect-mongo')(session)
const passport = require('passport')
const bcrypt = require('bcrypt')
const User = require('./modules/user')


mongoose.connect("mongodb+srv://Admin-Shubham:11816921@cluster0.bm81x.mongodb.net/interndb");
const connection = mongoose.connection;
connection.once('open', () => {
}).on('error',function (err) {
  console.log('conn fail');
})
let success = "false";
const companySchema = {
  email:String,
  name:String,
  companyName:String,
  product:String,
  details:String,
  template:String
}

const advertisement = {
  head:String,
  description:String,
  duration:String,
  textColor:String,
  color:String
}

const Info =  mongoose.model("companyInfo",companySchema);
const Ads = mongoose.model("ad",advertisement);

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './public/images/')
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname)
    }
})

const upload = multer({storage:storage});

let mongoStore = new MongoDBStore({
  mongooseConnection: connection,
  collection: 'sessions'
})

app.use(session({
  secret: 'secret',
  resave: false,
  store: mongoStore,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 24 } // 24 hour
}))

const passportInit = require('./views/passport')
passportInit(passport)
app.use(passport.initialize())
app.use(passport.session())

app.use(flash())
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));
app.set("view engine","ejs");
app.use(fileUpload())

app.use((req, res, next) => {
  res.locals.session = req.session
  res.locals.user = req.user
  next()
})

function guest(req,res,next){
  if(!req.isAuthenticated()){
    return next()
  }
  return res.redirect('/')
}

app.post("/login" ,function(req,res,next){
  passport.authenticate('local',(err,user,info)=>{
    if(err){
      req.flash('error', info.message )
      return next(err)
    }
    if(!user){
      req.flash('error', info.message )
      return res.redirect('/login')
    }
    req.logIn(user,(err)=>{
      if(err){
        console.log(err)
        return next(err)
      }
      req.flash('loggedin','Logged In Successfully!')
      return res.redirect('/profile')
    })
  })(req,res,next)
});

app.post("/register",function(req,res){
  
   const email = req.body.email;
   const name = req.body.name;
   const phoneno = req.body.phoneno;
   const password = req.body.password;
   const cname = req.body.cname;
   const details = req.body.details;
   const ordered = req.body.ordeered;

   User.exists({ email: email }, (err, result) => {
    if(result) {
        req.flash('error', 'Email Already Taken!')
        return res.redirect("/register")
        }
else{
  const saltRounds = 10;
  bcrypt.genSalt(saltRounds, function(err, salt) {
    bcrypt.hash(password, salt, function(err, hash) {
      if(err)
      {
        console.log('error')
      }
   const user = new User({
     email:email,
     name:name,
     phoneno:phoneno,
     password:hash,
     comapanyName:cname,
     details:details,
     ordeered:ordered,
   });

   user.save().then(()=>{
    console.log("sent")
    req.flash('reg','Account Registered Successfully!')
   return res.redirect("/login");
  }
  );
});
});
}
})
});

app.post("/updateuser",function(req,res,next){
  const email= req.user.email;
   User.findOneAndUpdate({email:email},{
    $set:{name : req.body.name, companyName : req.body.cname, phoneno : req.body.phone},
    }, function (err, result) {
      if (err) {
        console.log(err);
        return res.redirect('/profile');

      } else {
        req.user.name = req.body.name;
        req.user.companyName = req.body.cname;
        req.user.phoneno =req.body.phone;
       
 return res.redirect('/profile');
}

}
)
});


app.get("/", (req, res) => {
  mongoClient.connect('mongodb+srv://Admin-Shubham:11816921@cluster0.bm81x.mongodb.net/', { useNewUrlParser: true }, (err, client) => {
        let db = client.db('interndb')
        let collection = db.collection('themes')
        collection.find({}).toArray((err, doc) => {
            Ads.find({},function(err,obj){
              res.render("index",{array:doc,arr:obj});
            });
          })        
      })
});



app.get("/form",function(req,res){
  const title = req.body.title;

  res.render("form",{title:title});

});

app.post("/form",function(req,res){

  const select = req.body.select;
  const view = req.body.view;

  if(select!==undefined){
     res.render("form",{title:select});
  }

  if(view!==undefined){
     res.redirect(view);
  }

});

app.post("/companyInfo",function(req,res){
   const email = req.body.email;
   const name = req.body.name;
   const cname = req.body.cname;
   const product = req.body.product;
   const details = req.body.details;
   const template = req.body.template;

   const info = new Info({
     email:email,
     name:name,
     comapanyName:cname,
     product:product,
     details:details,
     template:template
   });

   info.save().then(()=>{console.log("sent")}
  );
});
const array = [];

app.post("/postAdd",function(req,res){
  const title = req.body.title;
  const desc = req.body.description;
  const duration = req.body.duration;
  let color = req.body.color;
  let textColor = req.body.textColor;
  if(color.length==0){
    color="#FFC069";
  }
  if(textColor.length==0){
    color="#000000";
  }
  const add = new Ads({
    head:title,
    description:desc,
    duration:duration,
    textColor:textColor,
    color:color
  });

  add.save().then(()=>{console.log("sent");}
 );
 res.redirect("/");
});
app.post("/posttheme", (req, res) => {
  let file = { title: req.body.title, thumbnail: binary(req.files.thumbnail.data), description: req.body.description,price: req.body.price,url: req.body.url,companyDetails: req.body.companyDetails,type: req.body.type }
  insertFile(file, res)
})
function insertFile(file, res) {
  mongoClient.connect('mongodb+srv://Admin-Shubham:11816921@cluster0.bm81x.mongodb.net', { useNewUrlParser: true }, (err, client) => {
        let db = client.db('interndb')
        let collection = db.collection('themes')
        try {
              collection.insertOne(file)
              console.log('File Inserted')
          }
          catch (err) {
              console.log('Error while inserting:', err)
          }
          res.redirect('/')
  })
}

app.get("/addForm",function(req,res){
  Ads.find({},function(err,obj){
      res.render("addForm",{obj:obj});

  });
});

app.get("/themeForm", async function(req,res){
  mongoClient.connect('mongodb+srv://Admin-Shubham:11816921@cluster0.bm81x.mongodb.net', { useNewUrlParser: true }, (err, client) => {
        let db = client.db('interndb')
        let collection = db.collection('themes')
        collection.find({}).toArray((err, doc) => {
            if (err) {
                console.log('err in finding doc:', err)
            }
            else {
                res.render("themeForm",{array:doc});
            }
        })
       })
});

app.post("/themeupdate",function(req,res){
  const id=mongoose.Types.ObjectId(req.body.id);
  mongoClient.connect('mongodb+srv://Admin-Shubham:11816921@cluster0.bm81x.mongodb.net', { useNewUrlParser: true }, (err, client) => {
    let db = client.db('interndb')
    let collection = db.collection('themes')
    collection.find({_id:id}).toArray((err, doc) => {
        if (err) {
            console.log('err in finding doc:', err)
        }
        else {
          res.render("themeupdate",{array:doc});
        }
    })
   })
});

app.post("/updatetheme",function(req,res){
  const id=mongoose.Types.ObjectId(req.body.id);
  mongoClient.connect('mongodb+srv://Admin-Shubham:11816921@cluster0.bm81x.mongodb.net', { useNewUrlParser: true }, (err, client) => {
    let db = client.db('interndb')
    let collection = db.collection('themes')
    try {
      if(req.files.thumbnail){
        collection.findOneAndUpdate({_id:id},{
          $set:{ title: req.body.title, thumbnail: binary(req.files.thumbnail.data), description: req.body.description,price: req.body.price,url: req.body.url,companyDetails: req.body.companyDetails, type: req.body.type }
        });
      res.redirect('/themeForm');
     }
     }
catch(err) {
  collection.findOneAndUpdate({_id:id},{
    $set:{ title: req.body.title, description: req.body.description,price: req.body.price,url: req.body.url,companyDetails: req.body.companyDetails, type: req.body.type }
  });
 res.redirect('/themeForm');
}
}
)
});

app.post("/delete",function(req,res){
  mongoClient.connect('mongodb+srv://Admin-Shubham:11816921@cluster0.bm81x.mongodb.net/', { useNewUrlParser: true }, (err, client) => {
    let db = client.db('interndb')
    let collection = db.collection('themes')
    const url =req.body.url;
  try{
    collection.deleteOne({url:url},function(err,item){
      if(err){
        console.log("cannot find the id in the your database.");
      }else{
        console.log("successfully deleted.");
        res.redirect("themeForm");
      }
    });
  }catch(e){
    console.log("somethinf went wrong while searching for your id");
  }
})
});

app.post("/deleteAd",function(req,res){
  const id = req.body.id;
 try{
   Ads.findOneAndDelete({_id:id},function(err,item){
     if(err){
       console.log("cannot find the id in the your database.");
     }else{
       console.log("successfully deleted.");
       res.redirect("addForm");
     }
   });
 }catch(e){
   console.log("something went wrong while deleting an Ad");
 }
});


app.get("/services",function(req,res){
  res.render("services");
});

app.get("/contactus",function(req,res){
  res.render("contactus");
});

app.get("/aboutus",function(req,res){
  res.render("aboutus");
});

app.get("/ourproducts",function(req,res){
  res.render("ourproducts");
});

app.get("/cart",function(req,res){
  res.render("cart");
});

app.get("/register",guest,function(req,res){
  res.render("register");
});

app.get("/login",guest,function(req,res){
  res.render("login");
});

app.get("/profile",function(req,res){
  res.render("profile");
});

app.post('/logout', function(req, res, next) {
  req.logout(function(err) {
    if (err) {console.log(err); return next(err); }
    req.flash('reg','Logged Out Successfully!')
    res.redirect('/login');
  });
});

app.post("/customsearch",function(req,res){
  let custom  = lodash.capitalize(req.body.search);
  let bool = false;
  mongoClient.connect('mongodb+srv://Admin-Shubham:11816921@cluster0.bm81x.mongodb.net/', { useNewUrlParser: true }, (err, client) => {
    let db = client.db('interndb')
    let collection = db.collection('themes')
    collection.find({}).toArray((err, doc) => {
      res.render("customsearch",{array:doc,custom:custom});
  })
  })
});

app.post("/sub-menu",function(req,res){
  let custom  = req.body.value;
  let bool = false;
  mongoClient.connect('mongodb+srv://Admin-Shubham:11816921@cluster0.bm81x.mongodb.net/', { useNewUrlParser: true }, (err, client) => {
    let db = client.db('interndb')
    let collection = db.collection('themes')
    collection.find({}).toArray((err, doc) => {
      res.render("customsearch",{array:doc,custom:custom});
  });
  })
});

app.get("/mongod356",function(req,res){
  Info.find({},function(err,item){
    res.send(item);
  });
});

app.listen(process.env.PORT||8000,function(){
  console.log("I am listening");
});
