const mongoose = require("mongoose");

const trainerSchema = mongoose.Schema({

    img: String,
    name: String,
    email:String,
    phoneNo: String,
});

module.exports = mongoose.model("trainer", trainerSchema);