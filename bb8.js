"use strict"

var Cylon = require('cylon');
var keypress = require("keypress");


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

          switch (key.name) {

            case "c":
            var myColor = setInterval(function () {
              my.bb8.randomColor();
            }, 1000);
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

            case "space":
              my.bb8.stop();
            break;

            case "q":
              var dir = 0;
              var interval = setInterval(function(){
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
                for (var i = 0; i <= 4; i++) {
                    var dir = 0;
                    var interval = setInterval(function () {
                        console.log("drive to direction: " + dir);
                        my.bb8.roll(30, dir);
                        dir = dir + 5;
                        if (dir >= 365) {
                            console.log("STOP!");
                            dir = 0;
                            clearInterval(interval);
                        }
                    }, 100);
                }
                my.bb8.stop();
            break;


          }


        }


        keypress(process.stdin);
        process.stdin.on("keypress", handle);

        process.stdin.setRawMode(true);
        process.stdin.resume();
    }
}).start();
