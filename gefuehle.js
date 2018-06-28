function panikWut() {
    player.sound('7.mp3', function () {
    });
    my.bb8.color({red: 255, green: 0, blue: 0}, function (err, data) {
        console.log(err || "Color Red");
    });
}

function freude() {
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
}