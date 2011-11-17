var sys = require('util');
var http = require('http');
var XMLHttpRequest = require("XMLHttpRequest").XMLHttpRequest;
var xhr = new XMLHttpRequest();
var sax = require("./sax"), strict = false, // set to false for html-mode
parser = sax.parser(strict, {
	normalize : true,
	trim : true,
	xmlns : true
});
var north = [], south = [];
var currentDirection = "Ignore";
var parseresult = "";
parser.onattribute = function(attribute) {
	if(parser.tag.name === "P") {
		if(attribute.name === "N") {
			if(attribute.value.indexOf("Northbound") != -1) {
				currentDirection = "North";
			} else if(attribute.value.indexOf("Southbound") != -1) {
				currentDirection = "South";
			} else {
				currentDirection = "Ignore";
			}
		}
	} else if(parser.tag.name === "T") {

		if(attribute.name === "L") {
			if(currentDirection === "North") {

				if(north.indexOf(attribute.value) < 0) {
					north.push(attribute.value);
				}
			} else if(currentDirection === "South") {
				if(south.indexOf(attribute.value) < 0) {
					south.push(attribute.value);
				}
			} else {
				return;
			}
		}

	}
}
xhr.onreadystatechange = function() {

	if(this.readyState == 4) {
		//	parser.write(this.responseText).end();

		var xml2js = require('xml2js');
		var parser = new xml2js.Parser();

		parser.addListener('end', function(result) {
			
			for(var sCounter = 0; sCounter < result.S.length; sCounter++) {
				
				for(var pCounter = 0; pCounter < result.S[sCounter].P.length; pCounter++) {
					console.log(result.S[sCounter].P[pCounter]['@'].N);
				}
			}
		});

		parser.parseString(this.responseText.replace(/^\uFEFF/, ''));
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