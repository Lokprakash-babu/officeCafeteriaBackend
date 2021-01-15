var express=require("express");
var app=express();
const bodyParser = require("body-parser");
app.use(express.json());
var cors=require('cors');
require('dotenv').config();
const MongoClient = require('mongodb').MongoClient

app.use(cors());
MongoClient.connect(`mongodb+srv://test:test@cluster0.jff4e.mongodb.net/hack?retryWrites=true&w=majority`,{ useUnifiedTopology: true })
.then(
    (client)=>{
        console.log('success in connection');

        //create a new db name newDb if it is not exist
        const db = client.db('newDb');

        //create a collection named users inside newDb
        const users=db.collection('users');

        //create a cursor inside collections for having access to the data stored in it
        const cursor = db.collection('users').find();


        //using body parser for post request
        app.use(bodyParser.urlencoded({ extended: false }));

        //exposing this endpoint for get Request
        app.get('/',function(req, res, next){
            res.send("API is working properly");
        })

        //exposting this endpoint for post request
        app.post('/', function(req, res){
            if(req['body']['isLogin']){
                cursor.toArray()
                .then(
                    (details)=>{
                        for(let i=0; i<details.length; i++){

                            if(details[i]['email']===req['body']['mailId']){
                                if(details[i]['mobile']===req['body']['mobile']){
                                    let message=JSON.stringify({auth: true});
                                    return res.end(message)
                                }
                                else{
                                    let message=JSON.stringify({auth:false});
                                    return res.end(message);
                                }
                            }
                        }
                        let message=JSON.stringify({auth:false, noUser:true})
                        return res.end(message);
                    },
                    (err)=>{
                        console.error('error in getting the db', err);
                    }
                )
            }
            else{
                cursor.toArray()
                .then(result=>{
                    let isThere=false;
                    for(let i=0; i<result.length; i++){
                        if(result[i]['email']===req['body']['email']){
                            isThere=true
                            break;
                        }
                    }
                    if(isThere){
                        let message=JSON.stringify({error: false, userExist: true, response:1234});
                        return res.end(message);
                    }
                    else{
                        let userId=req['body']['fullName'].slice(0, 3)+req['body']['email'];
                        req['body']['userId']=userId;
                        users.insertOne(req['body'])
                        .then(
                            ()=>{    
                                let message=JSON.stringify({error: false, userExist: false, response: userId});
                                return res.end(message);
                            }
                        ).catch((err)=>{
                            console.log('error in storing the data', err);
                        })
                    }
                })
                .catch(err=>console.log('error in fetching the results', err));
            }
        });
    }
).catch((err)=>console.log('error', err));


//configuring the port for server

let port = process.env.PORT;
if (port == null || port == "") {
  port = 9000;
}


app.listen(port, function(){
    console.log('server started successfully');
})
