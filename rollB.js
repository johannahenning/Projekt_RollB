"use strict";

var module = require('./koordinaten');

var Cylon = require('cylon');
var keypress = require("keypress");
var SoundPlayer = require('soundplayer');
var PubNub = require('pubnub');



var player = new SoundPlayer();





app.use(express.static('public'));

app.listen(8888, function () {
    console.log('Example app listening on port 8888!');
});

var pubnub = new PubNub({
    subscribeKey: "sub-c-5357b764-077f-11e8-b7c9-024a5d295ade"
});

const STOP = "stop";
const FARBE = "Farbe";
const USECASE = "Usecase";



console.log('Server running');

Cylon.robot({
    connections: {
        bluetooth: {adaptor: 'central', uuid: 'ef5b943330b9', module: 'cylon-ble'}
    },


    devices: {
        bb8: {driver: 'bb8', module: 'cylon-sphero-ble'}
    },

    work: function (my) {
        console.log("Wake up RollB");

        player.sound('5.mp3');
        for (var i = 0; i <= 50; i++) {
            my.bb8.randomColor();
            i++;
        }
        setTimeout(function () {
            my.bb8.setHeading(0, function (err, data) {
                console.log("SET HEADING");
            });
        }, 1000);


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
                        });
                }
            },
            message: function (PubNubMessage) {
                const messageType = PubNubMessage.message.Message.type;
                const messageBefehl = PubNubMessage.message.Message.befehl;

                console.log(PubNubMessage);
                switch (messageType) {
                    case USECASE:
                        switch (messageBefehl) {
                            case "verstecken":
                                verstecken();
                                break;
                            case "toilettenpapier":
                                break;
                            case "drehen":
                                my.bb8.roll(0, 90);
                                break;
                            case "einbrecher":
                                findeDenEinbrecher();
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

            switch (key.name) {
                case "r":
                    console.log("Start random LED show");
                    for (var i = 0; i <= 200; i++) {
                        my.bb8.randomColor();
                        i++;
                    }
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







        function bestaetigungston(callback) {
            player.sound('14.mp3', function () {
                console.log("sound done?");
            });
            my.bb8.color({red: 0, green: 255, blue: 0}, function (err, data) {
                console.log(err || "Color GREEN");
            });
            setTimeout(function () {
                my.bb8.color({red: 0, green: 0, blue: 255}, function (err, data) {

                    console.log(err || "Color BLUE");
                    callback();
                    console.log("Bestaetigunston fertig");
                });
            }, 1000);
        }

        function fertigton() {
            player.sound('16.mp3', function () {
            });
        }

        function kopfDrehen() {
            my.bb8.roll(0, 270);
            my.bb8.roll(0, 90);
            my.bb8.roll(0, 270);
        }

        function findeDenEinbrecher() {
            bestaetigungston(function () {
                driveToKoord(redTargetX, redTargetY, function () {
                    panikWut();
                });
            });
        }

        function verstecken() {
            bestaetigungston(function () {
                console.log("Drive To Koord");
                driveToKoord(yellowTargetX, yellowTargetY, function () {
                    freude();
                });
            });
        }

        function kreisFahren(callback) {
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
                    callback();
                }
            }, 100);
        }

        function katzePerson() {
            bestaetigungston(function () {
                driveToKoord(yellowTargetX, yellowTargetY, function () {
                    kreisFahren();
                    for (var i = 0; i <= 50; i++) {
                        my.bb8.randomColor();
                        i++;
                    }
                    player.sound('8.mp3', function () {
                    });
                });

            });
        }

        function hindernisse() {
            bestaetigungston();
            driveToKoord(yellowTargetX, yellowTargetY);
            //driveUmKord();
            //driveToKord();
            fertigton();
        }

        function klo() {
            bestaetigungston();
            driveToKoord(redTargetX, redTargetY);
            setTimeout(function () {
                my.bb8.stop();
            }, 6000);
            player.sound('11.mp3', function () {
            });
            driveToKoord(greenTargetX, greenTargetY);
            fertigton();
        }

        function einkaufen() {
            bestaetigungston();
            driveToKoord(greenTargetX, greenTargetY);
            kopfDrehen();
            driveToKoord(redTargetX, redTargetY);
            fertigton();
        }

        function party() {
            for (var i = 0; i <= 50; i++) {
                my.bb8.randomColor();
                i++;
            }
            player.sound('13.mp3', function () {
            });
            freude();
        }

        function verkehrspolizist() {
            bestaetigungston();
            driveToKoord(redTargetX, redTargetY);
            my.bb8.color({red: 255, green: 0, blue: 0}, function (err, data) {
                console.log(err || "Color RED");
            });
            kopfDrehen();
            setTimeout(function () {
                my.bb8.color({red: 0, green: 255, blue: 0}, function (err, data) {
                    console.log(err || "Color GREEN");
                });
            }, 6000);
            fertigton();
        }

        function blickkontakt() {

        }

        function karelBeeper() {
            bestaetigungston();
            driveToKoord(yellowTargetX, yellowTargetY);
            player.sound('2.mp3', function () {
            });
            driveToKoord(redTargetX, redTargetY);
            player.sound('2.mp3', function () {
            });
            driveToKoord(greenTargetX, greenTargetY);
            player.sound('2.mp3', function () {
            });
            freude();
            fertigton();
        }

        //unsicher ob das funktioniert weil wir können keinem Ziel hinterherfahren
        function lichtkegel() {
            driveToKoord(yellowTargetX, yellowTargetY);
            my.bb8.color({red: 0, green: 255, blue: 0}, function (err, data) {
                console.log(err || "Color GREEN");
            });
            setTimeout(function () {
                //driveAwayFromKord();
            }, 8000);
            panikWut();
            my.bb8.color({red: 255, green: 0, blue: 0}, function (err, data) {
                console.log(err || "Color RED");
            });
        }

        function personLokalisieren() {
            driveToKoord(redTargetX, redTargetY);
            freude();
        }

        function machMalWas() {
            bestaetigungston();
            //moveSquare();
            for (var i = 0; i <= 200; i++) {
                my.bb8.randomColor();
                i++;
            }
            fertigton();
        }



        keypress(process.stdin);
        process.stdin.on("keypress", handle);
        process.stdin.setRawMode(true);
        process.stdin.resume();
    }

}).start();
