"use strict";
var Cylon = require('cylon');
var keypress = require("keypress");
var SoundPlayer = require('soundplayer');
var PubNub = require('pubnub');

var express = require('express');
var app = express();
var uebermittelterWinkel;

app.get('/movementRollB/:x/:y', function (req, res) {
    xKoordRollB = req.params.x;
    yKoordRollB = req.params.y;
    res.end();
});

app.get('/movementGoal/:x/:y', function (req, res) {
    xKoordGoal = req.params.x;
    yKoordGoal = req.params.y;
    res.end();
});


app.use(express.static('public'));

app.listen(8888, function () {
    console.log('Example app listening on port 8888!');
});

var pubnub = new PubNub({
    subscribeKey: "sub-c-5357b764-077f-11e8-b7c9-024a5d295ade"
});

const STOP = "stop";
const RICHTUNG = "Richtung";
const FARBE = "Farbe";
const TONAUSGABE = "Tonausgabe";
const TRACKING = "Tracking";

var xKoordRollB = 0;
var yKoordRollB = 0;
var xKoordGoal = 0;
var yKoordGoal = 0;
var startKoordRollBX = 0;
var startKoordRollBY = 0;
var stopKoordRollBX = 0;
var stopKoordRollBY = 0;
var winkelStartDirection = 0;


console.log('Server running');

var trackingInterval;


Cylon.robot({
    connections: {
        bluetooth: {adaptor: 'central', uuid: 'ef5b943330b9', module: 'cylon-ble'}
    },


    devices: {
        bb8: {driver: 'bb8', module: 'cylon-sphero-ble'}
    },


    work: function (my) {
        pubnub.addListener({
            status: function (statusEvent) {
                if (statusEvent.category === "PNConnectedCategory") {
                    var payload = {
                        my: 'payload'
                    };
                    pubnub.publish(
                        {
                            message: payload
                        },
                        function (status) {
                            console.log("Wake up RollB");
                            var player = new SoundPlayer();
                            player.sound('5.mp3', function () {
                            });
                            for (var i = 0; i <= 50; i++) {
                                my.bb8.randomColor();
                                i++;
                            }
                            setTimeout(function () {
                                my.bb8.setHeading(0, function (err, data) {
                                    console.log("SET HEADING");
                                });
                            }, 1000);
                        }
                    );
                }
            },
            message: function (PubNubMessage) {
                const messageType = PubNubMessage.message.Message.type;
                const messageBefehl = PubNubMessage.message.Message.befehl;

                console.log(PubNubMessage);
                switch (messageType) {
                    case TRACKING:
                        switch (messageBefehl) {
                            case "koordinaten":
                                trackingInterval = setInterval(tracking, 2000);
                                break;
                        }
                        break;
                    case RICHTUNG:
                        switch (messageBefehl) {
                            case "links":
                                //  console.log("Drive left");
                                //  my.bb8.roll(100, 270);
                                trackingInterval = setInterval(tracking, 2000);
                                break;
                            case "rechts":
                                console.log("Drive right");
                                my.bb8.roll(100, 90);
                                break;
                            case "vorwärts":
                                console.log("Drive to front");
                                my.bb8.roll(100, 0);
                                break;
                            case "rückwärts":
                                console.log("Drive back");
                                my.bb8.roll(100, 180);
                                break;
                            case "kreis":
                                console.log("Start drive in a circle");
                                var count = 0;
                                var dir = 0;
                                var interval = setInterval(function () {
                                    console.log("drive to direction: " + dir);
                                    my.bb8.roll(30, dir);
                                    dir = dir + 5;
                                    if (dir >= 365) {
                                        dir = 0;
                                        console.log("Reset direction");
                                        count++;
                                    }
                                    if (count > 2) {
                                        clearInterval(interval);
                                        my.bb8.stop();
                                        console.log("STOP!");
                                    }
                                }, 100);
                                break;
                        }
                        break;

                    case STOP:
                        switch (messageBefehl) {
                            case "anhalten":
                            case "halt":
                            case "stop":
                                console.log("Stop!");
                                my.bb8.stop();
                                break;
                        }
                        break;
                    case FARBE:
                        switch (messageBefehl) {
                            case "rot":
                                my.bb8.color({red: 255, green: 0, blue: 0}, function (err, data) {
                                    console.log(err || "Color RED");
                                });
                                break;
                            case "grün":
                                my.bb8.color({red: 0, green: 255, blue: 0}, function (err, data) {
                                    console.log(err || "Color GREEN");
                                });
                                break;
                            case "blau":
                                my.bb8.color({red: 0, green: 0, blue: 255}, function (err, data) {
                                    console.log(err || "Color BLUE");
                                });
                                break;
                        }

                        break;

                    case TONAUSGABE:
                        if (messageBefehl === "tonausgabe" || messageBefehl === "sound") {
                            console.log("Play Sound File");
                            var player = new SoundPlayer();
                            player.sound('7.mp3', function () {
                            });
                        }
                        break;

                }
            }

        });
        pubnub.subscribe({
            channels: ['RollB']
        });


        function handle(ch, key) {

            if (!key)
                return;
            if (key.ctrl && key.name === "c") {
                process.stdin.pause();
                process.exit();
            }

            var player = new SoundPlayer();

            switch (key.name) {
                case "r":
                    console.log("Start random LED show");
                    for (var i = 0; i <= 200; i++) {
                        my.bb8.randomColor();
                        i++;
                    }
                    console.log("Play Sound File");
                    player.sound('2.mp3', function () {
                    });
                    break;
                case "k":
                    console.log("Change to random color");
                    my.bb8.randomColor();
                    break;
                case "w":
                    console.log("Drive to front");
                    my.bb8.roll(100, 0);
                    break;
                case "d":
                    console.log("Drive right");
                    my.bb8.roll(100, 90);
                    break;
                case "s":
                    console.log("Drive back");
                    my.bb8.roll(100, 180);
                    break;
                case "a":
                    console.log("Drive left");
                    my.bb8.roll(100, 270);
                    break;
                case "space":
                    console.log("Stop");
                    my.bb8.stop();
                    break;
                case "o":
                    console.log("Start drive in a circle");
                    var count = 0;
                    var dir = 0;
                    var interval = setInterval(function () {
                        console.log("drive to direction: " + dir);
                        my.bb8.roll(30, dir);
                        dir = dir + 5;
                        if (dir >= 365) {
                            dir = 0;
                            console.log("Reset direction");
                            count++;
                        }
                        if (count > 2) {
                            clearInterval(interval);
                            my.bb8.stop();
                            console.log("STOP!");
                        }
                    }, 100);
                    break;
                case ("y"):
                    console.log("Play Sound File");
                    player.sound('1.mp3', function () {
                    });
                    break;
                case ("x"):


                    console.log("Play Sound File");
                    player.sound('2.mp3', function () {
                    });
                    break;
                case ("c"):
                    console.log("Play Sound File");
                    player.sound('3.mp3', function () {
                    });
                    break;
                case ("v"):
                    console.log("Play Sound File");
                    player.sound('4.mp3', function () {
                    });
                    break;
                case ("b"):
                    console.log("Play Sound File");
                    player.sound('5.mp3', function () {
                    });
                    break;
                case ("n"):
                    var ausrichtung = 0;

                    if (xKoordRollB !== null && xKoordRollB !== 0 && xKoordRollB !== undefined) {
                        startKoordRollBX = xKoordRollB;
                        startKoordRollBY = yKoordRollB;
                        console.log("GOT START KOORDINATEN " + startKoordRollBX + " " + startKoordRollBY);

                        my.bb8.roll(70, 0);

                        setTimeout(function () {
                            my.bb8.stop();
                        }, 2000);

                        setTimeout(function () {
                            stopKoordRollBX = xKoordRollB;
                            stopKoordRollBY = yKoordRollB;
                            console.log("GOT DIRECTION KOORDINATEN " + stopKoordRollBX + " " + stopKoordRollBY);
                            winkelStartDirection = Math.atan((startKoordRollBY - stopKoordRollBY) / (startKoordRollBX - stopKoordRollBX));
                            console.log("WINKEL: " + winkelStartDirection * 180 / Math.PI);
                            ausrichtung = 360 - winkelStartDirection;
                        }, 4000);
                        setTimeout(function () {
                            my.bb8.roll(30, ausrichtung);
                        }, 5000);


                    }
                    break;


                /*console.log("Play Sound File");
                player.sound('6.mp3', function () {
                });
                break;*/
                case ("m"):
                    console.log("Play Sound File");
                    player.sound('7.mp3', function () {
                    });
                    break;
                case ("p"):
                    my.bb8.color({red: 0, green: 0, blue: 0}, function (err, data) {
                        console.log("LED OFF!");
                    });
                    break;
                default:
                    console.log("Key unknown, ROLLB SAYS NO");
                    player.sound('15.mp3', function () {
                    });
                    my.bb8.color({red: 255, green: 0, blue: 0}, function (err, data) {
                        console.log(err || "Color RED!");
                    });
                    setTimeout(function () {
                        my.bb8.color({red: 0, green: 0, blue: 0}, function (err, data) {
                            console.log("LED OFF!");
                        });
                    }, 6000);
            }

        }

        var direction = 0;
        var oldString = "oldString";
        var counter = 0;

        function tracking() {
            console.console.log(uebermittelterWinkel);
            console.log("OLD: " + oldString);

            if (xKoordRollB.includes("forward")) {
                my.bb8.roll(40, direction);
                console.log(xKoordRollB);
                oldString = "forward";
            } else if (xKoordRollB.includes("rotate")) {
                console.log(xKoordRollB);
                direction = (direction + 90) % 360;
                console.log(direction);
                my.bb8.roll(40, direction);
                oldString = "rotate";
            } else if (xKoordRollB.includes("stop")) {
                console.log("FERTIIIIIIIG");
                my.bb8.stop();
                clearInterval(trackingInterval);
                oldString = "stop";
            }
            else if (xKoordRollB.includes("outOfBorder") && !oldString.includes("outOfBorder")) {
                console.log(xKoordRollB);
                direction = (direction + 180 + counter) % 360;
                console.log(direction);
                my.bb8.roll(60, direction);
                counter += 90;
                oldString = "outOfBorder";
            }
            else if (xKoordRollB.includes("outOfBorder") && oldString.includes("outOfBorder")) {
                console.log(xKoordRollB);
                console.log(direction);
                console.log("AusnahmeFall oldString = outOfBorder");
                my.bb8.roll(50, direction);
                oldString = "oldString";
            }
        }

        //var trackingInterval = setInterval(tracking, 2000);

        /*function test() {
            console.log ("RollB" + xKoordRollB, yKoordRollB);
            console.log ("Goal" + xKoordGoal, yKoordGoal);
        }
        */


        keypress(process.stdin);
        process.stdin.on("keypress", handle);
        process.stdin.setRawMode(true);
        process.stdin.resume();
    }
}).start();
