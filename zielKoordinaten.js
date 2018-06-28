
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