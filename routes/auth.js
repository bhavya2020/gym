const Passport = require("../passport");
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const nodemailer=require('nodemailer');
const auth = require("../models/sql/sequelize").auth;
const Sequelize = require('sequelize');
const CONFIG = require("../configs");
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const models=require('../models/mongodb/mongo');


module.exports = function (app) {

    let Storage = multer.diskStorage({
        destination: './public_html/Images',
        filename: function (req, file, callback) {
            callback(null, file.originalname);
        }
    });
    let upload = multer({storage: Storage});

    /*
    functions
     */

    async function mailPassword(user, res) {

        // generate the token
        let token = await  function () {
            return new Promise((resolve) => {
                crypto.randomBytes(20, function (err, buf) {
                    let token = buf.toString('hex');
                    resolve(token);
                });
            })
        }();

        // update user table with token and expiry time
        await  function (token) {
            return new Promise((resolve) => {
                user.resetPasswordToken = token;
                user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
                user.save().then(() => {
                    resolve();
                }).catch((err) => {
                    console.log(err);
                });
            })
        }(token);

        // send the mail to the user's email id
        await  function (token, user) {
            return new Promise((resolve, reject) => {

                let smtpTransport = nodemailer.createTransport({
                    service: 'gmail',
                    // TODO: add username and password
                    auth: {
                        user: CONFIG.SERVER.MAIL,
                        pass: CONFIG.SERVER.PASS
                    }
                });
                let mailOptions = {
                    to: user.email,
                    from: CONFIG.SERVER.MAIL,
                    subject: 'Node.js Password Reset',
                    text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
                    'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
                    'http://' + CONFIG.SERVER.HOST + ":" + CONFIG.SERVER.PORT + '/reset/' + token + '\n\n' +
                    'If you did not request this, please ignore this email and your password will remain unchanged.\n'
                };
                smtpTransport.sendMail(mailOptions, function (err) {
                    if (err) {
                        reject();
                    } else {
                        resolve();
                    }
                });
            })
        }(token, user);
    }

    async function mailConfirmation(user, newPassword, res) {

        // update user table with new password and tokens
        await  function () {
            return new Promise((resolve) => {

                bcrypt.genSalt(10, function (err, salt) {
                    bcrypt.hash(newPassword, salt, function (err, hash) {
                        user.password = hash;
                        user.resetPasswordToken = null;
                        user.resetPasswordExpires = null;
                        user.save().then(() => {
                            resolve();
                        }).catch((err) => {
                            console.log(err);
                        });
                    })
                })
            })
        }();

        // send the mail to the user's email id regarding confirmation of password reset
        await  function (user) {
            return new Promise((resolve, reject) => {
                let smtpTransport = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: CONFIG.SERVER.MAIL,
                        pass: CONFIG.SERVER.PASS
                    }
                });
                let mailOptions = {
                    to: user.email,
                    from: CONFIG.SERVER.MAIL,
                    subject: 'Your password has been changed',
                    text: 'Hello,\n\n' +
                    'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
                };
                smtpTransport.sendMail(mailOptions, function (err) {
                    if (err) {
                        console.log(err);
                        reject();
                    } else {
                        resolve();
                    }
                });
            })
        }(user);
    }

// on submission of email/uname
    app.post('/forgot', (req, res) => {
        Users.find({
            where: {
                [Sequelize.Op.or]: [
                    {username: req.body.username},
                    {email: req.body.email}
                ]
            }
        })
            .then((user) => {
                if (!user) {
                    res.send("username/email not found");
                } else {

                    mailPassword(user, res)
                        .then(() => {


                            res.redirect('/');
                        })
                        .catch((err) => {
                            console.log(err);
                        })
                }
            })
            .catch((err) => {
                console.log(err);
            })

    });

// when clicked on link from email
    app.get('/reset/:token', (req, res) => {
        Users.find({
            where: {
                resetPasswordToken: req.params.token,
                resetPasswordExpires: {
                    [Sequelize.Op.gte]: Date.now()
                }
            }
        })
            .then((user) => {
                if (!user) {
                    res.send('Password reset token is invalid or link has expired.');
                } else {
                    res.send( {
                        user: user
                    });
                }
            })
            .catch((err) => {
                console.log(err);
            })
    });

// reset my password is clicked
    app.post('/reset/:token', (req, res) => {

        Users.find({
            where: {
                resetPasswordToken: req.params.token,
                resetPasswordExpires: {
                    [Sequelize.Op.gte]: Date.now()
                }
            }
        })
            .then((user) => {
                if (!user) {
                    res.send('Password reset token is invalid or link has expired.');
                } else {

                   return mailConfirmation(user, req.body.password, res)

                }
            })
            .then(() => {
                res.send('\'success\', \'Success! Your password has been changed.\'');

            }).catch((err) => {
            console.log(err);
        })
    });

//Render Login Page
    app.get("/login", (req, res) => {
        if (req.user) {
            if(req.user.isTrainer)
                res.redirect("/trainer");
            else
                res.redirect("/customer");

        }
        else
            res.send( {
                message: req.flash("loginMsg")
            });
    });

//Login Route
    app.post("/login", Passport.authenticate('local', {
        successRedirect: "/login",
        failureRedirect: "/login",
        failureFlash: true
    }));

//Render SignUp page
    app.get("/signup", (req, res) => {
        if (req.user)
        {
            if(req.user.isTrainer)
                res.redirect("/trainer");
            else
                res.redirect("/customer");

        }
        else
            res.send({
                message: req.flash("loginMsg")
            });
    });

//New User via SignUp route
    app.post("/signup/:isTrainer", upload.single('imgUploader'), function (req, res) {

    auth.find({
            where: {
                    username: req.body.username,
                }
        })
            .then((user) => {
                if (!user) {


                    if (req.params.isTrainer === "true") {
                        models.trainer.create({
                            name: req.body.name,
                            email: req.body.email,
                            phoneNo: req.body.phone,

                        }).then((trainer) => {
                            bcrypt.genSalt(10, function (err, salt) {
                                bcrypt.hash(req.body.password, salt, function (err, hash) {

                                    // Store hash in your password DB.
                                     auth.create({
                                        id: trainer._id.toString(),
                                        username: req.body.username,
                                        password: hash,
                                        isTrainer: true

                                    }).then((userAuth) => {
                                        fs.rename(path.join(__dirname, "../", "public_html/Images/", req.file.filename), path.join(__dirname, "../", "public_html/Images/", userAuth.id + ".jpg"), (err) => {
                                            if (err) {
                                                console.log(err);
                                            }
                                        });
                                        req.login(userAuth, (err) => {
                                            if (err) {
                                                console.log(err);
                                            }
                                            else {
                                                res.redirect('/login');
                                            }
                                        });
                                    }).catch((err)=>{
                                        console.log(err);
                                    })
                                })
                            })


                        })

                    }
                    else {
                        models.customer.create({
                            name: req.body.name,
                            email: req.body.email,
                            phoneNo: req.body.phone,
                            age: req.body.age,
                            gender: req.body.gender,
                            address: req.body.address

                        }).then((customer) => {

                            bcrypt.genSalt(10, function (err, salt) {
                                bcrypt.hash(req.body.password, salt, function (err, hash) {

                                    // Store hash in your password DB.
                                     auth.create({
                                        id: customer._id.toString(),
                                        username: req.body.username,
                                        password: hash,
                                        isTrainer: false

                                    }).then((userAuth) => {
                                         fs.rename(path.join(__dirname, "../", "public_html/Images/", req.file.filename), path.join(__dirname, "../", "public_html/Images/", userAuth.id + ".jpg"), (err) => {
                                             if (err) {
                                                 console.log(err);
                                             }
                                         });
                                         req.login(userAuth, (err) => {
                                             if (err) {
                                                 console.log(err);
                                             }
                                             else {
                                                 res.redirect('/customer/availableTrainer');
                                             }
                                         });
                                     }).catch((err)=>{
                                         console.log(err);
                                     })
                                })
                            })


                        })
                    }


                }
                else {
                    res.send("Username already taken");
                }
            })
            .catch((err) => {
                console.log(err);
            })


    });
//Logout route
    app.get("/logout", (req, res) => {
        req.logout();
        res.redirect("/");
    });
};