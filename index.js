const express = require('express');
// const { Db } = require('mongodb');
const app = express();
const session = require("express-session");
const cookieParser = require("cookie-parser");
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Db = require('mongodb/lib/db');
// const { match } = require('node:assert');
// const jwt = require("jsonwebtoken");

//This is for database
mongoose.connect("mongodb+srv://jk825405jay_db_user:Jay12345@cluster0.m1ouglq.mongodb.net/Second0")
.then(() => {
  console.log("MongoDB atlas connected");

  app.listen(3000, () => {
    console.log("Server started on port 3000");
  });
}).catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

const trySchema = new mongoose.Schema({
    username: String,
    email: String,
    password: String,
    
});

// BcYNFdeVLLimGock
// mongodb+srv://jk825405jay_db_user:Y1b3QHc1VI7w2Uhw@cluster0.qduspak.mongodb.net/
//App. uses
// jk825405jay_db_user


const item = mongoose.model("second", trySchema);


app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
//This is use for session;
app.use(session({
    secret: "secretwebsite",
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: false
    }
}));


//This is take the login-signup
app.get("/", (req, res) => {
    res.render("login-signup");
});


//This is for signup
app.post("/", async (req, res) => {

    const hashPssword = await bcrypt.hash(req.body.password, 10);
    try{
        const newUser = new item({
        username : req.body.username,
        email: req.body.email,
        password: hashPssword,
    });

    const findUser = await item.findOne({ email : req.body.email });

    if(findUser){
        return res.send("User are Already Exist!!")
    }else{
        await newUser.save();
    }

    res.redirect("/?from=login&signup=success");

    }catch(err){
        console.log(err);
    }
    
});

//this is made for logout -> This is work with session;
app.get("/logout", (req,res)=>{
    req.session.destroy(()=>{
        res.redirect("/")

    });
});

//This is for login route 
    app.post("/login" , async(req, res) => {
        try{
        const user = await item.findOne({
            email : req.body.email, 
            
        });
        if(!user){
            return res.send("User not found");
            
        }

        const match = await bcrypt.compare(req.body.password, user.password);
        if(match){
            req.session.userId = user._id;
            return res.redirect("/home");
            
        }else{
            // return res.redirect("/?error=wrongpassword");
        res.send(`Wrong Password..
            <script>
                setTimeout(() => {
                    window.location= "/";
                }, 1500);
            </script>`); 
            
        }
    }catch(err){
            
        console.log(err);
        res.render("login-signup");
        }
        
    });

app.get('/home', async (req, res)=>{
    if(!req.session.userId){
        return res.redirect("/")
    }else{
        try{
            const userData = await homeValue.find({
                userId : req.session.userId
            });

            res.render("home" , {
                data : userData,
                showUpdate: false,
                isLocked: userData.length > 0 ? userData[0].isLocked : false
            });
        }catch(err){
            console.log(err);
        }

    }

});






// Home Part Backend


//homeSchema
const homeSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "second"
    },
    textinputData : String,
    isLocked: {
        type: Boolean,
        default: true
    },
    CreatedAt : {
        type: Date,
        default: Date.now
    }
});

const homeValue = mongoose.model("homeData", homeSchema);

//toggalroute

app.get("/toggalLock", async (req,res)=>{
    const { isLocked } = req.body;

    try{
        await homeValue.updateMany(
            { userId: req.session.userId },
            { isLocked: isLocked}
        );
        
        res.json({ success: true });
    } catch (err){
        console.log(err);
        res.json({ success: false });
    }
});

//textDataRouting
app.post("/textData" , async (req, res)=>{
    if(!req.session.userId){
        res.redirect("/");
    }
   try{
     const hometextInputData = new homeValue({
       userId : req.session.userId,
       textinputData : req.body.text,

    });
    await hometextInputData.save();
    res.redirect("/home");

   }catch(err){
    console.log(err);
   }


     
});


app.get('/edithome/:id', async(req, res)=>{
    const id = req.params.id;

    const userData = await homeValue.find({
        userId: req.session.userId,
    });
    res.render("home", {
        data: userData,
        showUpdate: true,
        editId: id
    });
});

app.post("/updateData/:editid", async(req, res)=>{
    const id = req.params.editid;
    const updateData = req.body.updateDatatext;

    try{
        await homeValue.findByIdAndUpdate(id , {
            textinputData: updateData,
        });
        res.redirect("/home");
    }catch (err){
        console.log(err);      
    }
});

app.get('/deletehome/:id', async(req,res) =>{
    const id = req.params.id;
    await homeValue.findByIdAndDelete(id);
    res.redirect("/home");

});


