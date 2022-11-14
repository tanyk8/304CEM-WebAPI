const { Record } = require('./connect');
const express = require('express');
const app = express();
const axios = require('axios');
const cors = require('cors');
const {UserData} = require('./connect');
const port=5000;
const jwt=require('jsonwebtoken')

app.use(cors());

app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb', extended: true}));
app.use(express.json());

var app_sceneTitleName,app_sceneEpisodeNum,app_sceneTimeEstimate;
var app_aniImageURL,app_aniSynopsis,app_aniURL;
var app_email;
var app_date,app_time;

//register route for adding user
app.post('/api/register',async (req,res)=>{
    console.log(req.body)

    try{
        const user=await UserData.create({
            username: req.body.username,
            email:req.body.email,
            password:req.body.password
        })
        res.json({status:'ok'})
    }catch(err){
        res.json({status:'error', error:'Email already in use!'})
    }
})

//login route to check whether login credentials is matched to existing user
app.post('/api/login',async (req,res)=>{
    console.log(req.body)

    const user=await UserData.findOne({
        email:req.body.email,
        password:req.body.password})


    if(user){
        const token=jwt.sign({
            username: user.username,
            email:user.email,
        },'webapitokenINTI8')

        return res.json({status:'ok',user:token})
    }
    else{
        return res.json({status:'error',user:false})
    }
    
})

//get history route to get list of the search history
app.post('/api/gethistory',async (req,res)=>{
    const token=req.headers['x-access-token']

    try{
        const decoded=jwt.verify(token,'webapitokenINTI8')
        const email=decoded.email
        const result =await Record.find({historyemail:email}).sort({$natural:-1}).limit(10);
        return res.json({status:'ok',history: result})
    }catch(error){
        console.log(error)
        res.json({status:'error',error:'invalid token'})
    }
    
    
})

//add record route to add search data to database
app.get('/addRecord' ,(req, res) => {

    app_sceneTitleName = req.query.titlename;
    app_sceneEpisodeNum=req.query.epinum;
    app_sceneTimeEstimate=req.query.esttime;
    app_email=req.query.email;
    console.log(app_email)
    
    const url1=`https://api.jikan.moe/v4/anime?limit=1&q=`;

    axios.get(url1+req.query.titlename).then((result)=>{
        //console.log(res.data.data[0].title);
        
        app_aniImageURL=result.data.data[0].images.jpg.image_url;
        app_aniSynopsis=result.data.data[0].synopsis;
        app_aniURL=result.data.data[0].url;

        var currdate=new Date();
        app_date=currdate.getDate()+"/"+currdate.getMonth()+"/"+currdate.getFullYear();
        app_time=currdate.getHours()+":"+currdate.getMinutes();

        //declare new record
        var aniDataValue = new Record({
            historyemail:app_email,
            sceneTitleName:app_sceneTitleName,
            sceneEpisodeNum:app_sceneEpisodeNum,
            sceneTimeEstimate:app_sceneTimeEstimate,
            aniImageURL:app_aniImageURL,
            aniSynopsis:app_aniSynopsis,
            aniURL:app_aniURL,
            date:app_date,
            time:app_time,
        });

        //save to database
        aniDataValue
        .save()
        .then(result=> {
            console.log("Success" + result);
            res.send("ok");
        })
        .catch(error=> {
            console.log("Error 2" + error+"2");
        });
        
    });
});

//clear record route to clear history matched to the current logged in user
app.post('/api/clearRecord',async (req,res)=>{
    const token=req.headers['x-access-token']

    try{
        const decoded=jwt.verify(token,'webapitokenINTI8')
        const email=decoded.email
        const result =await Record.deleteMany({historyemail:email})
        if(result){
            const result2 =await Record.find({historyemail:email}).sort({$natural:-1}).limit(10);
            return res.json({status:'ok',history: result2})
        }
    }catch(error){
        console.log(error)
        res.json({status:'error',error:'invalid token'})
    }
    
    
})

//listen to port 5000
app.listen(port,()=>{  
      console.log("Server started on "+port);
}); //port 5000

