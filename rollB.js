"use strict"
var Cylon = require('cylon');
var keypress = require("keypress");
var SoundPlayer = require('soundplayer');
var PubNub = require('pubnub');

var pubnub = new PubNub({
    subscribeKey: "sub-c-5357b764-077f-11e8-b7c9-024a5d295ade"
});

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
                console.log(PubNubMessage);
                if (PubNubMessage.message.Message.type == "Richtung") {
                    if (PubNubMessage.message.Message.befehl == "links") {
                        console.log("Drive left");
                        my.bb8.roll(100, 270);
                    } else if (PubNubMessage.message.Message.befehl == "rechts") {
                        console.log("Drive right");
                        my.bb8.roll(100, 90);
                    } else if (PubNubMessage.message.Message.befehl == "vorwärts") {
                        console.log("Drive to front");
                        my.bb8.roll(100, 0);
                    }
                    else if (PubNubMessage.message.Message.befehl == "rückwärts") {
                        console.log("Drive back");
                        my.bb8.roll(100, 180);
                    }
                    else if (PubNubMessage.message.Message.befehl == "kreis") {
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
                    }
                } else if (PubNubMessage.message.Message.type == "stop") {
                    if (PubNubMessage.message.Message.befehl == "anhalten" || PubNubMessage.message.Message.befehl == "halt" || PubNubMessage.message.Message.befehl == "stop") {
                        console.log("Stop!");
                        my.bb8.stop();
                    }
                } else if (PubNubMessage.message.Message.type == "Tonausgabe") {
                    if (PubNubMessage.message.Message.befehl == "tonausgabe" || PubNubMessage.message.Message.befehl == "sound") {
                        console.log("Play Sound File");
                        var player = new SoundPlayer();
                        player.sound('7.mp3', function () {
                        });
                    }
                } else if (PubNubMessage.message.Message.type == "Farbe") {
                    if (PubNubMessage.message.Message.befehl == "rot") {
                        my.bb8.color({red: 255, green: 0, blue: 0}, function (err, data) {
                            console.log(err || "Color RED");
                        });
                    } else if (PubNubMessage.message.Message.befehl == "grün") {
                        my.bb8.color({red: 0, green: 255, blue: 0}, function (err, data) {
                            console.log(err || "Color GREEN");
                        });
                    } else if (PubNubMessage.message.Message.befehl == "blau") {
                        my.bb8.color({red: 0, green: 0, blue: 255}, function (err, data) {
                            console.log(err || "Color BLUE");
                        });
                    }
                }
            },
            presence: function (presenceEvent) {
                console.log("presece function");
            }
        })
        pubnub.subscribe({
            channels: ['RollB'],
        });


        function handle(ch, key) {
            if (key.ctrl && key.name === "c") {
                process.stdin.pause();
                process.exit();
            }
            var definedKeys = {
                "r": 1, "k": 1, "w": 1,
                "d": 1, "a": 1, "s": 1,
                "space": 1, "o": 1, "p": 1,
                "m": 1, "y": 1, "x": 1,
                "c": 1, "v": 1, "b": 1, "n": 1
            };
            if (definedKeys[key.name] !== undefined) {
                switch (key.name) {
                    case "r":
                        console.log("Start random LED show");
                        for (var i = 0; i <= 200; i++) {
                            my.bb8.randomColor();
                            i++;
                        }
                        console.log("Play Sound File");
                        var player = new SoundPlayer();
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
                    case "w":
                        my.bb8.setBackLed();
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
                        var player = new SoundPlayer();
                        player.sound('1.mp3', function () {
                        });
                        break;
                    case ("x"):
                        console.log("Play Sound File");
                        var player = new SoundPlayer();
                        player.sound('2.mp3', function () {
                            y
                        });
                        break;
                    case ("c"):
                        console.log("Play Sound File");
                        var player = new SoundPlayer();
                        player.sound('3.mp3', function () {
                        });
                        break;
                    case ("v"):
                        console.log("Play Sound File");
                        var player = new SoundPlayer();
                        player.sound('4.mp3', function () {
                        });
                        break;
                    case ("b"):
                        console.log("Play Sound File");
                        var player = new SoundPlayer();
                        player.sound('5.mp3', function () {
                        });
                        break;
                    case ("n"):
                        console.log("Play Sound File");
                        var player = new SoundPlayer();
                        player.sound('6.mp3', function () {
                        });
                        break;
                    case ("m"):
                        console.log("Play Sound File");
                        var player = new SoundPlayer();
                        player.sound('7.mp3', function () {
                        });
                        break;
                    case ("p"):
                        my.bb8.color({red: 0, green: 0, blue: 0}, function (err, data) {
                            console.log("LED OFF!");
                        });
                        break;
                }
            }
            else {
                console.log("Key unknown, ROLLB SAYS NO");
                var player = new SoundPlayer();
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

        keypress(process.stdin);
        process.stdin.on("keypress", handle);
        process.stdin.setRawMode(true);
        process.stdin.resume();
    }
}).start();
