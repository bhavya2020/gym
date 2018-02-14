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
        expiryDate:Number

    }]
});

module.exports = mongoose.model("exercise",exerciseSchema);