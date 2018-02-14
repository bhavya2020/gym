const Sequelize = require("sequelize");
const CONFIG = require("../../configs");

//DB Configuration
const database = new Sequelize(CONFIG.SQL.DATABASE, CONFIG.SQL.USER, CONFIG.SQL.PASSWORD, {
    dialect: "mysql",
    host: CONFIG.SQL.HOST,
    logging: false
});

//Test DB Connection
database.authenticate()
    .then(() => {
        console.log("Successful connection to DB");
    })
    .catch((err) => {
        console.log("Connection Error: " + err);
        process.exit();
    });

let auth = database.import("./auth.js");
auth.sync({alter:true});

module.exports = {
    auth
};