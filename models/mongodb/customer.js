const mongoose = require("mongoose");

const customerSchema = mongoose.Schema({

    trainerID:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "trainer"
    },
    name: String,
    gender: String,
    email:String,
    age:Number,
    address:String,
    phoneNo: String
});

module.exports = mongoose.model("customer", customerSchema);