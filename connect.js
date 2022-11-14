const mongoose = require('mongoose');
  
const db = "mongodb+srv://student:studentmongo@cluster0.bjbv5ic.mongodb.net/webapi?retryWrites=true&w=majority"; //connection string
  
mongoose
.connect(db)
.then(()=> {
    console.log("Connected to database"); //successful
})
.catch(()=> {
    console.log("Error Connecting to database"); //error
})


//search history schema matched with table in db
const heroSchema = new mongoose.Schema({
    historyemail:{type: String,required: true},
    sceneTitleName: {type: String},
    sceneEpisodeNum: {type: String},
    sceneTimeEstimate: {type: String},
    aniImageURL: {type: String},
    aniSynopsis: {type: String},
    aniURL:{type: String},
    date:{type: String},
    time:{type: String}},
    {collection: 'animes'}
);
const Record = mongoose.model('animes', heroSchema);

//user schema matched with table in db
const userSchema=new mongoose.Schema({
    username:{type: String,required: true},
    email:{type: String,required: true, unique:true},
    password:{type: String,required: true}},
    {collection: 'userdatas'}
)
const UserData=mongoose.model('userdatas',userSchema)

module.exports = { Record: Record, UserData: UserData }