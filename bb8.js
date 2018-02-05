"use strict"
var Cylon = require('cylon');
var keypress = require("keypress");
var SoundPlayer = require('soundplayer');
var PubNub = require('pubnub');

var pubnub = new PubNub( {
    subscribeKey: "sub-c-5357b764-077f-11e8-b7c9-024a5d295ade",
});

pubnub.addListener({
    status: function(statusEvent) {
        if (statusEvent.category === "PNConnectedCategory") {
            var payload = {
                my: 'payload'
            };
            pubnub.publish(
                {
                    message: payload
                },
                function (status) {
                    console.log("handle publish response");
                }
            );
        }
    },
    message: function(message) {

     console.log(message);
    // message: { DrehungMessage: { type: 'Drehung', command: 'links' } } }
        // console.log("Ich fuehre die message function aus");
       if ( message.message.DrehungMessage.type == "Drehung") {
           console.log("ich logge Drehung");
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
               if (count > 4) {
                   clearInterval(interval);
                   my.bb8.stop();
                   console.log("STOP!");
               }
           }, 100);
       }

    },
    presence: function(presenceEvent) {
        console.log("presece function");
    }
})
pubnub.subscribe({
    channels: ['RollB'],
});


Cylon.robot({
    connections: {
        bluetooth: {adaptor: 'central', uuid: 'ef5b943330b9', module: 'cylon-ble'}
    },
    devices: {
        bb8: {driver: 'bb8', module: 'cylon-sphero-ble'}
    },
    work: function (my) {
        function handle(ch, key) {
            if (key.ctrl && key.name === "c") {
                process.stdin.pause();
                process.exit();
            }
            if (key.name === "r" || key.name === "k" ||key.name === "w" ||key.name === "d" ||key.name === "a" ||
                key.name === "s" ||key.name === "space" || key.name === "o"
                ||key.name === "m" ||key.name === "y" ||key.name === "x" ||key.name === "c" ||key.name === "v" ||key.name === "b" ||key.name === "n") {
                switch (key.name) {
                    case "r":
                        console.log("Start random color");
                        for (var i = 0; i <= 200; i++) {
                            my.bb8.randomColor();
                            i++;
                        }
                        break;
                    case "k":
                        console.log("Random color");
                        my.bb8.randomColor();
                        break;
                    case "w":
                        console.log("Drive to front");
                        my.bb8.roll(100, 90);
                        break;
                    case "d":
                        console.log("Drive right");
                        my.bb8.roll(100, 180);
                        break;
                    case "s":
                        console.log("Drive back");
                        my.bb8.roll(100, 270);
                        break;
                    case "a":
                        console.log("Drive left");
                        my.bb8.roll(100, 0);
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
                            if (count > 4) {
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
                }
            }
            else {
                console.log("Key unknown, ROLLB SAYS NO");
                var player = new SoundPlayer();
                player.sound('15.mp3', function () {
                });
                my.bb8.color({ red: 255, green: 0, blue: 0 }, function(err, data) {
                    console.log(err || "Color RED!");
                });
            }
        }
        keypress(process.stdin);
        process.stdin.on("keypress", handle);
        process.stdin.setRawMode(true);
        process.stdin.resume();
    }
}).start();
