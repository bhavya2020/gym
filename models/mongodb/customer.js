const mongoose = require("mongoose");

const customerSchema = mongoose.Schema({
    img: String,
    name: String,
    gender: String,
    email:String,
    age:Number,
    address:String,
    phoneNo: String
});

module.exports = mongoose.model("customer", customerSchema);