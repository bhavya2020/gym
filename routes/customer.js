const route = require("express").Router();
const fs = require("fs");
const path = require("path");

//Import MongoDB models
const models = require("../models/mongodb/mongo");
const auth = require("../models/sql/sequelize").auth;

route.get('/availableTrainer',(req,res)=>{
    res.sendFile(path.join(__dirname,"../public_html/availableTrainer.html"));
});
route.post('/chooseTrainer',(req,res)=> {
    models.customer.find(
        {
            _id:req.user.id
        }
    ).then((customer)=>{
        customer.trainerID=req.body.id;
        customer.save().then(()=>{
            res.sendFile(path.join(__dirname,"../public_html/customerDash.html"));
        }).catch((Err)=>{
            console.log(Err);
        });

    }).catch((err)=>{
        console.log(err);
    });
});
module.exports = route;