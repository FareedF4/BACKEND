const express = require('express');
const userModel = require('./models/user');
const postModel = require('./models/post');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const app = express();

app.set("view engine","ejs");
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());


app.get('/',(req,res)=>{
    res.render("index");
})

app.get('/profile',isLoggedIn,async (req,res)=>{
    console.log(req.user);
    let user = await userModel.findOne({email : req.user.email}).populate("posts");//used to convert the refernece id on name form can be redirectded to posts form
    
    console.log(user);
    res.render("profile",{user});
})

app.get('/like/:id',isLoggedIn,async (req,res)=>{
    console.log(req.user);
    let post = await postModel.findOne({_id : req.params.id})//.populate("user");used to convert the refernece id on name form can be redirectded to posts form
    
    // console.log(user);
    if(post.likes.indexOf(req.user.userid) === -1){
        post.likes.push(req.user.userid);
    }
    else{
        post.likes.splice(post.likes.indexOf(req.user.userid),1);
    }
    await post.save();

    res.redirect("/profile");
})

app.get('/edit/:id',isLoggedIn,async (req,res)=>{
    console.log(req.user);
    let post = await postModel.findOne({_id : req.params.id})//.populate("user");//used to convert the refernece id on name form can be redirectded to posts form
    res.render("edit",{post});
})

app.post('/update/:id',isLoggedIn,async (req,res)=>{
    console.log(req.user);
    let post = await postModel.findOneAndUpdate({_id : req.params.id},{content : req.body.content})

    res.redirect("/profile");
})



app.post('/post',isLoggedIn,async (req,res)=>{
    let user = await userModel.findOne({email : req.user.email});
    let {content} = req.body;
    let post = await postModel.create({
        user: user._id,
        content : content
    })
    
    user.posts.push(post._id);
    await user.save();
    res.redirect("/profile");
})

app.get('/login',(req,res)=>{
    res.render("login");
})

app.post('/register', async (req,res)=>{
   let {email,username,password,name,age} = req.body;
   
   let user = await userModel.findOne({email})

   if(user) return res.status(500).send("Oops Something went wrong..")

    bcrypt.genSalt(10,(err,salt)=>{
        console.log(salt);

        bcrypt.hash(password,salt,async (err,hash)=>{
            console.log(hash);
          let user = await userModel.create({
                username,
                email,
                age,
                name,
                password:hash
            })

            let token = jwt.sign({email:email,userid:user._id},"fareed");
            res.cookie("token",token);
            res.render("login");
        })
    })
    
})

app.post('/login', async (req,res)=>{
    let {email,password} = req.body;
    
    let user = await userModel.findOne({email})
 
    if(!user) return res.status(500).send("Oops Something went wrong..")
 
     bcrypt.compare(password,user.password,(err,result) =>{
        if(result){
            let token = jwt.sign({email:email,userid:user._id},"fareed");
            res.cookie("token",token);
            res.status(200).redirect("/profile");
        }
        else res.redirect("/login");
     });
 })

 app.get('/logout',(req,res)=>{
    res.cookie("token","");
    res.redirect("/login");
})

function isLoggedIn(req,res,next){
    if(req.cookies.token === "") res.redirect("/login");
    else{
        let data = jwt.verify(req.cookies.token,"fareed");
        req.user = data;
        next();
    }
}


app.listen(3000);