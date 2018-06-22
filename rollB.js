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

app.get('/yellowTarget/:x/:y', function (req, res) {
    yellowTargetX = req.params.x;
    yellowTargetY = req.params.y;
    res.end();
});

app.get('/redTarget/:x/:y', function (req, res) {

    redTargetX = req.params.x;
    redTargetY = req.params.y;
    res.end();
});

app.get('/greenTarget/:x/:y', function (req, res) {

    greenTargetX = req.params.x;
    greenTargetY = req.params.y;
    res.end();
});

app.get('/blueTarget/:x/:y', function (req, res) {

    blueTargetX = req.params.x;
    blueTargetY = req.params.y;
    res.end();
});

app.get('/purpleTarget/:x/:y', function (req, res) {

    purpleTargetX = req.params.x;
    purpleTargetY = req.params.y;
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
const USECASE = "Usecase";

//TARGET
var greenTargetX = 0;
var greenTargetY = 0;
var redTargetX = 0;
var redTargetY = 0;
var yellowTargetX = 0;
var yellowTargetY = 0;
var blueTargetX = 0;
var blueTargetY = 0;
var purpleTargetX = 0;
var purpleTargetY = 0;


//RollB
var xKoordRollB = 0;
var yKoordRollB = 0;
var startKoordRollBX = 0;
var startKoordRollBY = 0;
var stopKoordRollBX = 0;
var stopKoordRollBY = 0;

var ausrichtungWinkel = 0;
var winkelZumZiel = 0;
var neuerWinkel;
var player = new SoundPlayer();


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


        pubnub.addListener({
            status: function (statusEvent) {
                if (statusEvent.category === "PNConnectedCategory") {
                    var payload = {
                        my: 'payload'
                    };
                    pubnub.publish(
                        {
                            message: payload

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

                    case USECASE:
                        switch (messageBefehl){
                            case "verstecken":
                                verstecken ();
                                break;
                            case "toilettenpapier":
                                
                        }

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
                    driveToKoord(yellowTargetX, yellowTargetY);
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
                    my.bb8.color({red: 0, green: 255, blue: 255}, function (err, data) {
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
            console.log(uebermittelterWinkel);
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

        var aktuellesX = 0;
        var aktuellesY = 0;
        // var trackingInterval = setInterval(tracking, 200);

        var zielInterval = setInterval(test, 200);

        function test() {
            aktuellesX = xKoordRollB;
            aktuellesY = yKoordRollB;
            console.log(aktuellesX);
            console.log(aktuellesY);
        }

        function freude (){
            player.sound('10.mp3', function () {
            });
            my.bb8.color({red: 255, green: 0, blue: 0}, function (err, data) {
                console.log(err || "Color RED");
            });
            setTimeout(function () {
                my.bb8.color({red: 0, green: 0, blue: 255}, function (err, data) {
                    console.log(err || "Color BLUE");
                });
            }, 1000);
            setTimeout(function () {
                my.bb8.color({red: 0, green: 255, blue: 0}, function (err, data) {
                    console.log(err || "Color GREEN");
                });
            }, 2000);
            setTimeout(function () {
                my.bb8.color({red: 255, green: 255, blue: 0}, function (err, data) {
                    console.log(err || "Color DONTKNOW");
                });
            }, 3000);
        }
        
        function trauer() {
            player.sound('6.mp3', function () {
            });
            my.bb8.color({red: 0, green: 0, blue: 255}, function (err, data) {
                console.log(err || "Color BLUE");
            });
        }
        
        function panikWut() {
            player.sound('7.mp3', function () {
            });
            my.bb8.color({red: 255, green: 0, blue: 0}, function (err, data) {
                console.log(err || "Color Red");
            });
        }

        function bestaetigungston(){
            player.sound('14.mp3', function () {
            });
            my.bb8.color({red: 0, green: 255, blue: 0}, function (err, data) {
                console.log(err || "Color GREEN");
            });
            setTimeout(function () {
                my.bb8.color({red: 0, green: 255, blue: 0}, function (err, data) {
                    console.log(err || "Color BLUE");
                });
            }, 2000);
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

        function verstecken () {
            bestaetigungston(); //Bestaetigungston abspielen
            driveToKoord(yellowTargetX,yellowTargetY); //fährt zu einem Versteck
            setTimeout(function () {
                my.bb8.stop();
            }, 6000); //wartet dort für 6 Sekunden; Zeitintervall
            freude();
            fertigton(); //Fertigton abspielen
        }

        function katzePerson() {
            bestaetigungston();
            function spielen() {
                driveToKoord(yellowTargetX, yellowTargetY);
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
                }, 100); //Kreis
                for (var i = 0; i <= 50; i++) {
                    my.bb8.randomColor();
                    i++;
                }
                player.sound('8.mp3', function () {
                });
            }
            driveToKoord(redTargetX, redTargetY); //zurück fahren
            fertigton();
        }

        function personImHaus (){
            bestaetigungston();
            /*if (person im Haus ){
                freude();
                driveToKord();
            } else {
                trauer();
            }*/
            fertigton();
        }

        function hindernisse(){
            bestaetigungston();
            driveToKoord(yellowTargetX, yellowTargetY);
            //driveUmKord();
            //driveToKord();
            fertigton();
        }

        function klo(){
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

        function party(){
            for (var i = 0; i <= 50; i++) {
                my.bb8.randomColor();
                i++;
            }
            player.sound('13.mp3', function () {
            });
            freude();
        }

        function verkehrspolizist (){
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
        
        function blickkontakt () {
            
        }

        function karelBeeper(){
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
        function lichtkegel(){
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
        
        function personLokalisieren () {
            driveToKoord(redTargetX, redTargetY);
            freude();
        }
        
        function machMalWas () {
            bestaetigungston();
            //moveSquare();
            for (var i = 0; i <= 200; i++) {
                my.bb8.randomColor();
                i++;
            }
            fertigton();
        }

        function driveToKoord(zielKoordX, zielKoordY) {
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
                    ausrichtungWinkel = Math.atan((startKoordRollBY - stopKoordRollBY) / (startKoordRollBX - stopKoordRollBX));
                    ausrichtungWinkel = ausrichtungWinkel * 180 / Math.PI;
                    console.log("WINKEL: " + ausrichtungWinkel);

                    //drives from top left to bottom right
                    if (startKoordRollBY < stopKoordRollBY && startKoordRollBX < stopKoordRollBX) {
                        console.log("links oben nach rechts unten");
                        ausrichtung = 360 - ausrichtungWinkel;

                        //drives from bottom left to top right
                    } else if (startKoordRollBY > stopKoordRollBY && startKoordRollBX < stopKoordRollBX) {
                        console.log("links unten nach rechts oben");
                        ausrichtung = (-ausrichtungWinkel);

                        //drives from top right to bottom left
                    } else if (startKoordRollBY < stopKoordRollBY && startKoordRollBX > stopKoordRollBX) {
                        console.log("rechts oben nach links unten");
                        ausrichtung = 180 + (-ausrichtungWinkel);

                        //drives from bottom left to top right
                    } else if (startKoordRollBY > stopKoordRollBY && startKoordRollBX > stopKoordRollBX) {
                        console.log("links unten nach rechts oben");
                        ausrichtung = 180 - ausrichtungWinkel;
                    }

                }, 4000);
                setTimeout(function () {
                    console.log("ausrichtung: " + ausrichtung);
                    my.bb8.roll(0, ausrichtung);
                }, 5000);
                setTimeout(function () {
                    my.bb8.stop();
                }, 6000);

                //AUSRICHTUNG ABGESCHLOSSEN!!! RollB schaut in der Kamera nach rechts

                setTimeout(function () {
                    stopKoordRollBX = xKoordRollB;
                    stopKoordRollBY = yKoordRollB;
                    console.log("NeueStopKoords: " + stopKoordRollBX + stopKoordRollBY);
                    //Berechnung vom Winkel zum Ziel
                    winkelZumZiel = Math.atan((stopKoordRollBY - zielKoordY) / (stopKoordRollBX - zielKoordX));
                    winkelZumZiel = winkelZumZiel * 180 / Math.PI;

                    console.log("Winkel zum Ziel: " + winkelZumZiel);

                    //rollB: bottom right target: top left
                    if (stopKoordRollBY > zielKoordY && stopKoordRollBX > zielKoordX) {
                        console.log("rollB: bottom right target: top left");
                        neuerWinkel = ausrichtung + 180 + winkelZumZiel;

                        //rollB: bottom left target: top right
                    } else if (stopKoordRollBY > zielKoordY && stopKoordRollBX < zielKoordX) {
                        console.log("rollB: bottom left target: top right");
                        neuerWinkel = ausrichtung - (-winkelZumZiel);

                        //rollB: top left target: bottom right ??????
                    } else if (stopKoordRollBY < zielKoordY && stopKoordRollBX < zielKoordX) {
                        console.log("rollB: top left target: bottom right");
                        neuerWinkel = ausrichtung + winkelZumZiel;

                        //rollB: top right target: bottom left
                    } else if (stopKoordRollBY < zielKoordY && stopKoordRollBX > zielKoordX) {

                        console.log("rollB: top right target: bottom left");
                        neuerWinkel = ausrichtung + (180 - (-winkelZumZiel));
                    }

                    my.bb8.roll(30, (neuerWinkel) % 360);

                    var distanceX = zielKoordX - aktuellesX;
                    var distanceY = zielKoordY - aktuellesY;

                    var distanceToMovingObjekt = Math.sqrt(distanceX * distanceX + distanceY * distanceY);


                    if (distanceToMovingObjekt < 50) {
                        console.log("ICH STOPPE");
                        my.bb8.stop();

                        my.bb8.setHeading(0, function (err, data) {
                            console.log("SET HEADING");
                        });
                        clearInterval(zielInterval);
                    }

                }, 6000);

            }
        }

        keypress(process.stdin);
        process.stdin.on("keypress", handle);
        process.stdin.setRawMode(true);
        process.stdin.resume();
    }

}).start();
