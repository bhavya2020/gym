//Import Passport
const passport = require("passport");
//Import LocalStrategy module
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require('bcryptjs');

//Import Auth Model'
const Users = require("./models/sql/sequelize.js").auth;

//Import MongoDB models
const models = require("./models/mongodb/mongo");
//Serialize user
passport.serializeUser(function (user, done) {
    done(null, user.id);
});

//De-Serialize User
passport.deserializeUser(function (id, done) {
    Users.findById(id)
        .then((user) => {
            done(null, user);
        })
        .catch((err)=>{
            console.log(err);
        })
});

//Define LocalStrategy
const localstrategy = new LocalStrategy(
    {
        passReqToCallback : true
    },
    function (req, username, password, done) {
        auth.findOne({
            where: {
                username: username
            }
        })
            .then((userAuth) => {
                if (userAuth == null) {
                    return done(null, false, req.flash("loginMsg","Username not found !"));
                } else {

                    bcrypt.compare(password, userAuth.password).then((res) => {
                        // res === true
                        if (res) {

                            if(userAuth.isTrainer)
                            {
                                models.trainer.findById(userAuth.id)
                                    .then((trainer)=>{

                                        return done(null, trainer);
                                    })
                                    .catch((err)=>{
                                    console.log(err);
                                    })

                            }
                            else
                            {
                                models.customer.findById(userAuth.id)
                                    .then((customer)=>{

                                        return done(null, customer);
                                    })
                                    .catch((err)=>{
                                        console.log(err);
                                    })
                            }
                            return done(null, user);
                        }
                        else {
                            return done(null, false, req.flash("loginMsg","Password incorrect !"));
                        }

                    });
                }
            })
            .catch((err)=>{
                console.log(err);
            })
    }
);

//User "localstrategy" at "local"
passport.use('local', localstrategy);

//Expose passport to be used in server.js
module.exports = passport;