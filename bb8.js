"use strict"

var Cylon = require('cylon');
var keypress = require("keypress");
var SoundPlayer = require('soundplayer');


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

            if (key.name === "r" || key.name === "k" ||key.name === "w" ||key.name === "d" ||key.name === "a" ||key.name === "s"
                ||key.name === "space" || key.name === "q" ||key.name === "o"
                ||key.name === "m" ||key.name === "y" ||key.name === "x" ||key.name === "c" ||key.name === "v" ||key.name === "b" ||key.name === "n") {

                switch (key.name) {

                    case "r":
                        for (var i = 0; i <= 300; i++) {
                            my.bb8.randomColor();
                            i++;
                        }
                        console.log("Stop Random Color");
                        break;

                    case "k":
                        my.bb8.randomColor();
                        break;

                    case "w":
                        my.bb8.randomColor();
                        my.bb8.roll(100, 90);
                        break;

                    case "d":
                        my.bb8.randomColor();
                        my.bb8.roll(100, 180);
                        break;

                    case "s":
                        my.bb8.randomColor();
                        my.bb8.roll(100, 270);
                        break;

                    case "a":
                        my.bb8.randomColor();
                        my.bb8.roll(100, 0);
                        break;

                    case "w":
                        my.bb8.setBackLed();
                        break;

                    case "space":
                        my.bb8.stop();
                        break;

                    case "q":
                        var dir = 0;
                        var interval = setInterval(function () {
                            console.log("drive to direction: " + dir);
                            my.bb8.roll(30, dir);
                            dir = dir + 90;
                            if (dir === 450) {
                                console.log("STOP!");
                                my.bb8.stop();
                                clearInterval(interval);
                            }
                        }, 3000);
                        break;

                    case "o":

                        var count = 0;
                        var dir = 0;
                        var interval = setInterval(function () {
                            console.log("drive to direction: " + dir);
                            my.bb8.roll(30, dir);
                            dir = dir + 5;
                            if (dir >= 365) {
                                dir = 0;
                                console.log("Wieder auf 0");
                                count++;
                            }
                            if (count > 4) {
                                clearInterval(interval);
                                my.bb8.stop();
                                console.log("ENDE!");
                            }
                        }, 100);

                        break;

                    case ("y"):
                        var player = new SoundPlayer();
                        player.sound('1.mp3', function () {
                        });
                        break;

                    case ("x"):
                        var player = new SoundPlayer();
                        player.sound('2.mp3', function () {
                        });
                        break;

                    case ("c"):
                        var player = new SoundPlayer();
                        player.sound('3.mp3', function () {
                        });
                        break;

                    case ("v"):
                        var player = new SoundPlayer();
                        player.sound('4.mp3', function () {
                        });
                        break;

                    case ("b"):
                        var player = new SoundPlayer();
                        player.sound('5.mp3', function () {
                        });
                        break;

                    case ("n"):
                        var player = new SoundPlayer();
                        player.sound('6.mp3', function () {
                        });
                        break;

                    case ("m"):
                        var player = new SoundPlayer();
                        player.sound('7.mp3', function () {
                        });
                        break;
                }
            }
            else {
                console.log("Key unknown");
                var player = new SoundPlayer();
                player.sound('15.mp3', function () {
                });
            }

        }


        keypress(process.stdin);
        process.stdin.on("keypress", handle);

        process.stdin.setRawMode(true);
        process.stdin.resume();
    }
}).start();