const Passport = require("../passport");
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const Users = require("../models/sql/sequelize").Users;
const Sequelize = require('sequelize');
const CONFIG = require("../configs");
const multer = require('multer');
const fs = require('fs');
const path = require('path');


module.exports = function (app) {

    let Storage = multer.diskStorage({
        destination: './public_html/Images',
        filename: function (req, file, callback) {
            callback(null, file.originalname);
        }
    });
    let upload = multer({storage: Storage});
    // cloudinary.config({
    //     cloud_name: 'auctioneeer',
    //     api_key: '553296924422138',
    //     api_secret: 'YNGylxUU6jLGb9Ioc2P44b07gfQ'
    // });

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
        if (req.user)
            res.redirect("/users");
        else
            res.send( {
                message: req.flash("loginMsg")
            });
    });

//Login Route
    app.post("/login", Passport.authenticate('local', {
        successRedirect: "/users",
        failureRedirect: "/login",
        failureFlash: true
    }));

//Render SignUp page
    app.get("/signup", (req, res) => {
        if (req.user)
            res.redirect("/users");
        else
            res.send({
                message: req.flash("loginMsg")
            });
    });

//New User via SignUp route
    app.post("/signup", upload.single('imgUploader'), function (req, res) {

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
                    bcrypt.genSalt(10, function (err, salt) {
                        bcrypt.hash(req.body.password, salt, function (err, hash) {
                            // Store hash in your password DB.
                            Users.create({
                                username: req.body.username,
                                password: hash,
                                name: req.body.name,
                                email: req.body.email,
                                phone1: req.body.phone1,
                                phone2: req.body.phone2,
                            })
                                .then((user) => {
                                    let imgName;
                                    if (req.file) {
                                        imgName = req.file.filename;
                                        fs.rename(path.join(__dirname, "../", "public_html/Images/", imgName), path.join(__dirname, "../", "public_html/Images/", user.id + ".jpg"), (err) => {
                                            if (err) {
                                                console.log(err);
                                            }
                                            else {
                                                //Store image url in DB
                                                user.img = "/Images/" + user.id;
                                                user.save()
                                                    .then(() => {
                                                        req.login(user, (err) => {
                                                            if (err) {
                                                                console.log(err);
                                                            }
                                                            else {
                                                                res.redirect('/login');
                                                            }
                                                        });
                                                    })
                                                    .catch((err) => {
                                                        console.log(err);
                                                    })
                                            }
                                        })
                                    }
                                    else {
                                        user.img = "/images/user.png";
                                        user.save()
                                            .then(() => {
                                                req.login(user, (err) => {
                                                    if (err) {
                                                        console.log(err);
                                                    }
                                                    else {
                                                        res.redirect('/login');
                                                    }
                                                });
                                            })
                                            .catch((err) => {
                                                console.log(err);
                                            })
                                    }
                                }).catch((err) => {
                                console.log(err);
                            })
                        })
                    })
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