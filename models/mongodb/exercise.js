const mongoose = require("mongoose");

const exerciseSchema = mongoose.Schema({

    trainerID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "trainer"
    },
    customerID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "customer"
    },
    exercises: [{


        exerciseName:String,
        exerciseDescription:String,
        currDate: {
            type: Date,
            default: Date.now
        },
        expiryDate: {
            type: Date,
            default: Date.now+15*3600*24
        }

    }]
});

module.exports = mongoose.model("exercise",exerciseSchema);