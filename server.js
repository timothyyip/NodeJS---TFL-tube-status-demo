var sys = require('util'), http = require('http'), datejs = require('datejs');
var XMLHttpRequest = require("XMLHttpRequest").XMLHttpRequest, xhr = new XMLHttpRequest();
var xml2js = require('xml2js'), parser = new xml2js.Parser();
var north= new Array( ), south =  new Array( );

var getMMSSInSeconds = function(timeString) {
	var time = Date.parse('January 1, 1970 00:' + timeString);
	return (time) ? Date.parse('January 1, 1970 00:' + timeString).getTime() / 1000 : false;
}

xhr.onreadystatechange = function() {

	if(this.readyState == 4) {
		//	parser.write(this.responseText).end();

		parser.addListener('end', function(result) {
			for(var sCounter = 0; sCounter < result.S.length; sCounter++) {
				for(var pCounter = 0; pCounter < result.S[sCounter].P.length; pCounter++) {

					var isNorth = (result.S[sCounter].P[pCounter]['@'].N.indexOf("Northbound") != -1);
					if(result.S[sCounter].P[pCounter].T) {
						for(var tCounter = 0; tCounter < result.S[sCounter].P[pCounter].T.length; tCounter++) {
							var trainLocation = result.S[sCounter].P[pCounter].T[tCounter]['@'].L;

							if(isNorth) {

								if(north[trainLocation]) {
									if(getMMSSInSeconds(result.S[sCounter].P[pCounter].T[tCounter]['@'].C)) {//if time to station is valid
										if(getMMSSInSeconds(result.S[sCounter].P[pCounter].T[tCounter]['@'].C) < north[trainLocation]) {//if this tts is less than stored tts
											north[trainLocation] = getMMSSInSeconds(result.S[sCounter].P[pCounter].T[tCounter]['@'].C);
											//store this tts
										}
									} else {
										north[trainLocation] = 0;
										//is tts is invalid then its already at a station effectively meaning tts is 0
									}
								} else {
									north[trainLocation] = getMMSSInSeconds(result.S[sCounter].P[pCounter].T[tCounter]['@'].C);
								}

							} else {//TODO: I hate this, must be a way to use some kind of reflection for this
								
								if(south[trainLocation]) {
								
									if(getMMSSInSeconds(result.S[sCounter].P[pCounter].T[tCounter]['@'].C)) {//if time to station is valid
										if(getMMSSInSeconds(result.S[sCounter].P[pCounter].T[tCounter]['@'].C) < south[trainLocation]) {//if this tts is less than stored tts
											south[trainLocation] = getMMSSInSeconds(result.S[sCounter].P[pCounter].T[tCounter]['@'].C);
											//store this tts
										}
									} else {
										
										south[trainLocation] = 0;
										//is tts is invalid then its already at a station effectively meaning tts is 0
									}
								} else {
									south[trainLocation] = getMMSSInSeconds(result.S[sCounter].P[pCounter].T[tCounter]['@'].C);
								}

							}
						}
					}
				}
			}
			console.log(north);
			console.log(south);
		});
		try {
			parser.parseString(this.responseText.replace(/^\uFEFF/, ''));
			
			
		} catch(err) {
			throw err;
		}
	}

};
//setInterval(function() { north = [], south = [];
xhr.open("GET", "http://cloud.tfl.gov.uk/TrackerNet/PredictionSummary/V");
xhr.send();
//}, 30000);
/**
 var app = require('express').createServer(), io = require('socket.io').listen(app);

 app.listen(4000);

 setInterval(function() {
 io.sockets.emit('message', {
 north : north,
 south : south,
 result : parseresult
 });
 }, 10000);

 app.get('/', function(req, res) {
 res.sendfile(__dirname + '/connect.html');
 });

 app.get('/mapping.js', function(req, res) {
 res.sendfile(__dirname + '/mapping.js');
 });
 **/