const route = require("express").Router();
const fs = require("fs");
const path = require("path");

//Import MongoDB models
const models = require("../models/mongodb/mongo");
const auth = require("../models/sql/sequelize").auth;

route.get('/',(req,res)=>{
    res.sendFile(path.join(__dirname,"../public_html/trainerDash.html"));
});
route.get('/all',(req,res)=>{
    models.trainer.find({})
        .then((trainers)=>{

        res.send(trainers);
        }).catch((err)=>{
        console.log(err);
    })
});
route.get('/exercises',(req,res)=>{
    models.exercise.find({
        trainerID: req.user.dataValues.id
    }).then((customers)=>{
        res.send(customers);
    })
});
route.post('/add',(req,res)=>{

    models.exercise.findOne({
        trainerID: req.user.dataValues.id,
        customerID:req.body.id
    }).then((exercise)=>{
        exercise.exercises.push({
            exerciseName:req.body.name,
            exerciseDescription:req.body.description,
            expiryDate:parseInt(new Date().getTime()+15*24*3600*1000)
        });
        exercise.save()
            .then(()=>{
            res.send()
            }).catch((Err)=>{
            console.log(Err);
        })
    }).catch((Err)=>{
        console.log(Err);
    })
});
route.get('/details/:id',(req,res)=>{
    models.trainer.findOne({
        _id:req.params.id
    })
        .then((trainer)=>{
            res.send(trainer);
        })
        .catch((err)=>{
            console.log(err);
        })
});

module.exports = route;
