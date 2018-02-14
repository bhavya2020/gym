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
    models.customer.findOne(
        {
            _id:req.user.dataValues.id
        }
    ).then((customer)=>{
        customer.trainerID=req.body.id;
        customer.save(customer).then(()=>{
            models.exercise.create({
                customerID:customer._id,
                trainerID:customer.trainerID,
                exercises: []
            }).then(()=>{
                res.send();
            }).catch((err)=>{
                console.log(err);
            })

        }).catch((Err)=>{
            console.log(Err);
        });

    }).catch((err)=>{
        console.log(err);
    });
});

route.get('/currentexercise',(req,res)=>{

    models.exercise.findOne({
        customerID:req.user.dataValues.id
    })
        .then((exercises)=>{
            let exercisetosend=[];
            if(!exercises)
            {
                res.send({msg: "no exercies"});
            }else {
                for (let exercise of exercises.exercises) {
                    if (exercise.expiryDate > Date.now()) {
                        exercisetosend.push(exercise);
                    }
                }
                res.send(exercisetosend);
            }
        })
        .catch((err)=>{
            console.log(err);
        })

});

route.get('/history',(req,res)=>{

    models.exercise.findOne({
        customerID:req.user.dataValues.id
    })
        .then((exercises)=>{
            res.send(exercises.exercises);
        })
        .catch((err)=>{
            console.log(err);
        })

});
route.post('/history',(req,res)=>{

    models.exercise.findOne({
        customerID:req.body.id
    })
        .then((exercises)=>{
            res.send(exercises.exercises);
        })
        .catch((err)=>{
            console.log(err);
        })

});


route.get('/custProfile',(req,res)=>{

    models.customer.findOne({
        _id:req.user.dataValues.id
    })
        .then((customer)=>{
            res.send(customer);
        })
        .catch((err)=>{
            console.log(err);
        })

});

route.get('/trainerDetails',(req,res)=>{
    models.customer.findOne({
        _id:req.user.dataValues.id
    })
        .then((customer)=>{
            res.redirect(`/trainers/details/${customer.trainerID}`);
        })
        .catch((err)=>{
            console.log(err);
        })
});

module.exports = route;