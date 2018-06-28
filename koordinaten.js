"use strict";

app.get('/movementRollB/:x/:y', function (req, res) {
    xKoordRollB = req.params.x;
    yKoordRollB = req.params.y;
    res.end();
});

//RollB
var xKoordRollB = 0;
var yKoordRollB = 0;
var startKoordRollBX = 0;
var startKoordRollBY = 0;
var stopKoordRollBX = 0;
var stopKoordRollBY = 0;

var ausrichtungWinkel = 0;
var winkelZumZiel = 0;
var neuerWinkelZumZiel;


var aktuellesX = 50;
var aktuellesY = 50;


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

            //links oben nach rechts unten
            if (startKoordRollBY < stopKoordRollBY && startKoordRollBX < stopKoordRollBX) {
                ausrichtung = 360 - ausrichtungWinkel;

                //links unten nach rechts oben
            } else if (startKoordRollBY > stopKoordRollBY && startKoordRollBX < stopKoordRollBX) {
                ausrichtung = (-ausrichtungWinkel);

                //rechts oben nach links unten
            } else if (startKoordRollBY < stopKoordRollBY && startKoordRollBX > stopKoordRollBX) {
                ausrichtung = 180 + (-ausrichtungWinkel);

                //links unten nach rechts oben
            } else if (startKoordRollBY > stopKoordRollBY && startKoordRollBX > stopKoordRollBX) {
                ausrichtung = 180 - ausrichtungWinkel;
            }

        }, 2000);
        setTimeout(function () {
            my.bb8.roll(0, ausrichtung);
        }, 3000);
        setTimeout(function () {
            my.bb8.stop();
        }, 3500);

        //AUSRICHTUNG ABGESCHLOSSEN!!! RollB schaut in der Kamera nach rechts

        setTimeout(function () {
            stopKoordRollBX = xKoordRollB;
            stopKoordRollBY = yKoordRollB;


            //Berechnung vom Winkel zum Ziel
            winkelZumZiel = Math.atan((stopKoordRollBY - zielKoordY) / (stopKoordRollBX - zielKoordX));
            winkelZumZiel = winkelZumZiel * 180 / Math.PI;


            //rollB: bottom right target: top left
            if (stopKoordRollBY > zielKoordY && stopKoordRollBX > zielKoordX) {
                neuerWinkelZumZiel = ausrichtung + 180 + winkelZumZiel;

                //rollB: bottom left target: top right
            } else if (stopKoordRollBY > zielKoordY && stopKoordRollBX < zielKoordX) {
                neuerWinkelZumZiel = ausrichtung - (-winkelZumZiel);

                //rollB: top left target: bottom right
            } else if (stopKoordRollBY < zielKoordY && stopKoordRollBX < zielKoordX) {
                neuerWinkelZumZiel = ausrichtung + winkelZumZiel;

                //rollB: top right target: bottom left
            } else if (stopKoordRollBY < zielKoordY && stopKoordRollBX > zielKoordX) {
                neuerWinkelZumZiel = ausrichtung + (180 - (-winkelZumZiel));
            }

            neuerWinkelZumZiel = neuerWinkelZumZiel % 360;

            my.bb8.roll(70, neuerWinkelZumZiel);

            var distanceToMovingObjekt = 10000;

            var distanzInterval = setInterval(function () {
                aktuellesX = xKoordRollB;
                aktuellesY = yKoordRollB;

                var distanceX = zielKoordX - aktuellesX;
                var distanceY = zielKoordY - aktuellesY;

                distanceToMovingObjekt = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

                if (distanceToMovingObjekt < 50) {
                    my.bb8.stop();

                    my.bb8.setHeading(0, function (serr, data) {
                        console.log("SET HEADING");
                    });
                    clearInterval(distanzInterval);
                    callback();
                }
            }, 200);

        }, 1000);

    }
}