var sys = require('util'), http = require('http'), datejs = require('datejs');
var XMLHttpRequest = require("XMLHttpRequest").XMLHttpRequest, xhr = new XMLHttpRequest();
var xml2js = require('xml2js'), parser = new xml2js.Parser();
var trains = new Array();

var getMMSSInSeconds = function(timeString) {
	var time = Date.parse('January 1, 1970 00:' + timeString);
	return (time) ? Date.parse('January 1, 1970 00:' + timeString).getTime() / 1000 : false;
}

xhr.onreadystatechange = function() {

	if(this.readyState == 4) {
		//	parser.write(this.responseText).end();

		parser.addListener('end', function(result) {
			trains= new Array();
			
			for(var sCounter = 0; sCounter < result.S.length; sCounter++) {

				for(var pCounter = 0; pCounter < result.S[sCounter].P.length; pCounter++) {

					var isNorth = (result.S[sCounter].P[pCounter]['@'].N.indexOf("Northbound") != -1);

					if(result.S[sCounter].P[pCounter].T) {

						for(var tCounter = 0; tCounter < result.S[sCounter].P[pCounter].T.length; tCounter++) {

							var trainId = result.S[sCounter].P[pCounter].T[tCounter]['@'].S;

							var trainLocation = result.S[sCounter].P[pCounter].T[tCounter]['@'].L;
							var trainIdIdentifier = trainLocation;
							var trainTimeTillStation = getMMSSInSeconds(result.S[sCounter].P[pCounter].T[tCounter]['@'].C);
							if(!trainTimeTillStation) {
								trainTimeTillStation = 0;
							}

							if(trains[trainIdIdentifier]) {

								if(trainTimeTillStation < trains[trainIdIdentifier].tts) {//if this tts is less than stored tts
									trains[trainIdIdentifier].tts = trainTimeTillStation;
									trains[trainIdIdentifier].isNorth = isNorth;
								}

							} else {

								trains[trainIdIdentifier] = {
									'id' : trainId,
									'tts' : trainTimeTillStation,
									'isNorth' : isNorth,
									'location' : trainLocation
								};
							}

						}
					}
				}
			}
			
			var trainarray = [];
			for(var prop in trains) {
				trainarray.push(trains[prop])
			}
			
		});
		try {
			parser.parseString(this.responseText.replace(/^\uFEFF/, ''));

		} catch(err) {
			throw err;
		}
	}

};
setInterval(function() { north = [], south = [];
	xhr.open("GET", "http://cloud.tfl.gov.uk/TrackerNet/PredictionSummary/V");
	xhr.send();
}, 30000);
var app = require('express').createServer(), io = require('socket.io').listen(app);

app.listen(4000);

setInterval(function() {
	console.log(trains.toString());
	var trainarray = [];
	for(var prop in trains) {
		trainarray.push(trains[prop])
	}
	io.sockets.emit('message', trainarray);
}, 10000);

app.get('/', function(req, res) {
	res.sendfile(__dirname + '/connect.html');
});

app.get('/mapping.js', function(req, res) {
	res.sendfile(__dirname + '/mapping.js');
});
