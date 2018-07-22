"use strict";
var Cylon = require('cylon');
var keypress = require("keypress");
var SoundPlayer = require('soundplayer');
var PubNub = require('pubnub');

var express = require('express');
var app = express();

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

var aX = 50;
var aY = 50;

var richtung = 0;

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
                    case TRACKING:
                        switch (messageBefehl) {
                            case "koordinaten":
                                trackingInterval = setInterval(tracking, 2000);
                                break;
                        }
                        break;

                    case USECASE:
                        switch (messageBefehl) {
                            case "einbrecher":
                                findeDenEinbrecher();
                                break;
                            case "verstecken":
                                verstecken();
                                break;
                            case "haustier": //Tier/person
                                tierPerson();
                                break;
                            case "personimhaus":
                                personImHaus();
                                break;
                            case "toilettenpapier": //klo
                                klo();
                                break;
                            case "einkaufen":
                                einkaufen();
                                break;
                            case "party":
                                party();
                                break;
                            case "verkehrspolizist":
                                verkehrspolizist();
                                break;
                            case "machwas":
                                machMalWas();
                                break;
                            case "drehen":
                                my.bb8.roll(0, richtung += 90);
                                break;
                            case "gefuehl":
                                randomGefuehl();
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
                    player.sound('ichHasseEs.mp3', function () {
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

        function freude(callback) {
            player.sound('soundfiles/Freude/wuhuu.mp3');
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
            callback();
        }

        function randomGefuehl() {
            var gefuehlsFunktionen = [trauer(), wut(), freude()];

            function randomNumber(n) {
                return Math.floor(Math.random() * n);
            }

            gefuehlsFunktionen[randomNumber(gefuehlsFunktionen.length)]();
        }

        function wut() {
            player.sound('soundfiles/WutPanik/scheiße.mp3');
        }

        function trauer() {
            player.sound('soundfiles/Trauer/auwwh.mp3', function () {
                player.sound('soundfiles/Trauer/ouuuh2.mp3');
            });
            my.bb8.color({red: 0, green: 0, blue: 255}, function (err, data) {
                console.log(err || "Color BLUE");
            });
        }

        function panik() {
            /*player.sound('soundfiles/WutPanik/dasDarfDochNichtWahrSein.mp3', function () {
            });*/
            my.bb8.color({red: 255, green: 0, blue: 0}, function (err, data) {
                console.log(err || "Color Red");
            });
        }

        function bestaetigungsFarbe(callback) {
            my.bb8.color({red: 0, green: 255, blue: 0}, function (err, data) {
                console.log(err || "Color GREEN");
                callback();
            });
            /*
            setTimeout(function () {
                my.bb8.color({red: 0, green: 0, blue: 255}, function (err, data) {
                    console.log(err || "Color BLUE");
                    callback();
                });

            }, 1000);
            */
        }

        function kopfDrehen() {
            my.bb8.roll(0, 270);
            my.bb8.roll(0, 90);
            my.bb8.roll(0, 270);
        }

        //Einbrecher Usecase
        function findeDenEinbrecher() {
            bestaetigungsFarbe(function () {
                player.sound('soundfiles/Einbrecher/ichFindeDenEinbrecher.mp3', function () { //"ich finde den einbrecher"
                    driveToKoord(redTargetX, redTargetY, function () {
                        panik();
                        player.sound('soundfiles/Einbrecher/verschwindeDuDummerEinbrecher.mp3', function () {
                            player.sound('soundfiles/Einbrecher/hauAb.mp3', function () {
                                player.sound('soundfiles/Einbrecher/verschwinde2.mp3');//„verschwinde du dummer Einbrecher“, „hau ab“, „geh bitte wieder weg“
                            });
                        });
                    });
                });
            });
        }

        //Verstecken Usecase
        function verstecken() {
            bestaetigungsFarbe(function () {
                player.sound('soundfiles/Verstecken/klarFangAnZuZählen2.mp3', function () { //"klar, fang an zu zählen!"
                    driveToKoord(yellowTargetX, yellowTargetY, function () {
                        setTimeout(function () {
                            player.sound('soundfiles/Verstecken/duHastMichGefunden.mp3'); //"oh du hast mich gefunden ..."
                        }, 5000);
                    });
                });

            });
            setTimeout((function () {
                player.sound('soundfiles/Verstecken/oderWirSpielenWasAnderes2.mp3');
            }), 8000)
        }

        function kreisFahren(callback) {
            console.log("Start drive in a circle");
            var count = 0;
            var dir = 0;
            var interval = setInterval(function () {
                console.log("drive to direction: " + dir);
                my.bb8.roll(30, dir);
                dir = dir + 7;
                my.bb8.randomColor();
                if (dir >= 365) {
                    dir = 0;
                    console.log("Reset direction");
                    count++;
                }
                if (count > 1) {
                    clearInterval(interval);
                    my.bb8.stop();
                    callback();
                    console.log("STOP!");
                }
            }, 100);
        }

        //Kuscheltier Person
        function tierPerson() {
            bestaetigungsFarbe(function () {
                driveToKoord(yellowTargetX, yellowTargetY, function () {
                    kreisFahren(function () {
                        player.sound("soundfiles/Tier/dasHatSpassGemacht6.mp3");
                    });
                    /*     for (var i = 0; i <= 50; i++) {
                             my.bb8.randomColor();
                             i++;
                         }
                         */
                    player.sound('soundfiles/Tier/duziduzi.mp3');
                });


            });
        }

        //UseCase4
        function personImHaus() {
            bestaetigungsFarbe(function () {
                var aktuellesTarget = 0;

                player.sound("soundfiles/PersonImHaus/okIchPrüfeDas2.mp3", function () {
                    var altesTarget = "falsch";
                    var istJemandDa = setInterval(function () {
                        aktuellesTarget = blueTargetX;
                        console.log("BLAUESZIEL!!!" + aktuellesTarget);
                        console.log("ALTES TARGET" + altesTarget);
                        if (typeof aktuellesTarget === "undefined" || aktuellesTarget === undefined || aktuellesTarget === 0) {
                            altesTarget = "ja";
                            player.sound('soundfiles/Trauer/auwwh.mp3', function () {
                                    player.sound('soundfiles/PersonImHaus/niemandenGefunden3.mp3');
                                });
                        } else if (altesTarget === "ja" && aktuellesTarget !== 0) {
                            player.sound('soundfiles/PersonImHaus/hierIstJemand5.mp3', function () {
                                //player.sound('soundfiles/Freude/juhuu.mp3');
                                freude(function () {
                                    clearInterval(istJemandDa);
                                });
                            });
                            altesTarget = "falsch";
                        } else {
                            console.log("ELSE");
                        }
                    });
                });
            });
        }

        //UseCase5
        function klo() {
            bestaetigungsFarbe(function () {
                player.sound('soundfiles/Klo/aufToilette.mp3', function () { //"oh ich merke ich muss aufs klo..."
                    driveToKoord(blueTargetX, blueTargetY, function () {
                        setTimeout(function () {
                            player.sound('soundfiles/Klo/piss.mp3');
                            player.sound('soundfiles/Klo/flushing-the-toilet.mp3', function () {
                                driveToKoord(redTargetX, redTargetY, function () {
                                    player.sound('soundfiles/Klo/dasWarErleichternd.mp3');
                                });
                            });
                        }, 5000);
                    });
                })
            });
        }

        //Einkaufen
        function einkaufen() {
            bestaetigungsFarbe(function () {
                driveToKoord(blueTargetX, blueTargetY, function () {
                    kopfDrehen(function () {
                        driveToKoord(redTargetX, redTargetY, function () {
                            player.sound('soundfiles/Einkaufen/einkaufenGehen.mp3', function () { //"ich hätte gerne milch, eier..."
                                setTimeout(function () {
                                    driveToKoord(yellowTargetX, yellowTargetY, function () {
                                        player.sound('soundfiles/Einkaufen/sachenEingekauft.mp3');
                                    });
                                }, 5000);
                            });
                        })
                    })
                })
            });
        }

        //UseCase7
        function party() {
            setTimeout(function () {
                my.bb8.roll(20, 90)
            }, 500);
            setTimeout(function () {
                my.bb8.roll(20, 180)
            }, 1000);
            setTimeout(function () {
                my.bb8.roll(20, 270)
            }, 1500);
            setTimeout(function () {
                my.bb8.roll(20, 0)
            }, 2000);
            setTimeout(function () {
                my.bb8.stop();
            }, 2500);
            player.sound('soundfiles/Tanzen/lassUnsTanzen2.mp3', function () { //"disco disco party party"
                for (var i = 0; i <= 50; i++) {
                    my.bb8.randomColor();
                    i++;
                }
                player.sound('lied.mp3', function () {
                    freude(callback);
                });
            });

        }

        //UseCase8
        function verkehrspolizist() {
            bestaetigungsFarbe(function () {
                driveToKoord(yellowTargetX, yellowTargetY, function () { //Straße AUTO!!!!
                    my.bb8.color({red: 255, green: 0, blue: 0}, function (err, data) {
                        console.log(err || "Color RED");
                    }, function () {
                        player.sound('soundfiles/Verkehrspolizist/stehenBleiben2.mp3', function () { //"bitte anhalten!"
                            kopfDrehen(function () {
                                player.sound('soundfiles/Verkehrspolizist/weiterFahren.mp3'); //"jetzt weiterfahren"
                                my.bb8.color({red: 0, green: 255, blue: 0}, function (err, data) {
                                    console.log(err || "Color GREEN");
                                });
                            });
                        });
                    });
                })
            });
        }

        //UseCase9
        function machMalWas() {
            bestaetigungsFarbe(function () {
                player.sound('soundfiles/MachWas/viereckFahren.mp3', function () { //„ich kann im viereck fahren zum beispiel“
                    moveSquare(function () {
                        for (var i = 0; i <= 200; i++) {
                            my.bb8.randomColor();
                            i++;
                        }
                    });
                });
            });
        }

        function moveSquare(callback) {
            my.bb8.roll(60, 0);
            setTimeout(function () {
                my.bb8.roll(60, 90);
            }, 2000);
            setTimeout(function () {
                my.bb8.roll(60, 180);
            }, 4000);
            setTimeout(function () {
                my.bb8.roll(60, 270);
            }, 6000);
            setTimeout(function () {
                my.bb8.stop();
            }, 8000);
            callback();
        }

        function driveToKoord(zielKoordX, zielKoordY, callback) {
            var ausrichtung = 0;

            if (xKoordRollB !== null && xKoordRollB !== 0 && xKoordRollB !== undefined) {
                startKoordRollBX = xKoordRollB;
                startKoordRollBY = yKoordRollB;
                console.log("GOT START KOORDINATEN " + startKoordRollBX + " " + startKoordRollBY);

                my.bb8.roll(70, 0);

                setTimeout(function () {
                    my.bb8.stop();
                }, 1000);

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

                }, 2000);
                setTimeout(function () {
                    console.log("ausrichtung: " + ausrichtung);
                    my.bb8.roll(0, ausrichtung);
                }, 3000);
                setTimeout(function () {
                    my.bb8.stop();
                }, 4000);

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

                    my.bb8.roll(70, (neuerWinkel) % 360);

                    var distanceToMovingObjekt = 10000;

                    var interval = setInterval(function () {
                        aX = xKoordRollB;
                        aY = yKoordRollB;

                        var distanceX = zielKoordX - aX;
                        var distanceY = zielKoordY - aY;

                        distanceToMovingObjekt = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

                        if (distanceToMovingObjekt < 200) {
                            console.log("ICH STOPPE");
                            my.bb8.stop();

                            my.bb8.setHeading(0, function (serr, data) {
                                console.log("SET HEADING");
                            });
                            clearInterval(interval);
                            callback();
                        }
                    }, 200);
                }, 6000);
            }
        }

        keypress(process.stdin);
        process.stdin.on("keypress", handle);
        process.stdin.setRawMode(true);
        process.stdin.resume();
    }

}).start();