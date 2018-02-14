const route = require("express").Router();
const fs = require("fs");
const path = require("path");

//Import MongoDB models
const models = require("../models/mongodb/mongo");
const auth = require("../models/sql/sequelize").auth;

route.get('/all',(req,res)=>{
    models.trainer.find({})
        .then((trainers)=>{

        res.send(trainers);
        }).catch((err)=>{
        console.log(err);
    })
});
module.exports = route;
