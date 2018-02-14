const mongoose = require("mongoose");

const trainerSchema = mongoose.Schema({

    name: String,
    email:String,
    phoneNo: String,
});

module.exports = mongoose.model("trainer", trainerSchema);