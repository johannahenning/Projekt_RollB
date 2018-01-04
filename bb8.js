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
              my.bb8.roll(30, 0);
              after(3000, function() {
                my.bb8.roll(30, 90);
              });
              after(6000, function() {
                my.bb8.roll(30, 180);
              });
              after(9000, function() {
                my.bb8.roll(30, 270);
              });
              after(12000, function() {
                my.bb8.stop();
              });
            break;

            case "l":
              console.log("drive circle");
              var timer = 0;
              var dir = 0;
              while(dir < 360) {
                after(timer, function() {
                  if(dir >= 360)  {
                    my.bb8.stop();
                    console.log("stop circle");
                  }
                  else {
                    my.bb8.toll(30, dir);
                    timer = timer + 500;
                    dir = dir + 20;
                  }
                });
              }
            break;
          }
        }

        keypress(process.stdin);
        process.stdin.on("keypress", handle);

        process.stdin.setRawMode(true);
        process.stdin.resume();
    }
}).start();
