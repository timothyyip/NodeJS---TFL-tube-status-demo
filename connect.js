var http = require('http'),util = require('util'),DomJS = require("dom-js").DomJS,domjs = new DomJS();
var client = http.createClient(80, 'cloud.tfl.gov.uk'),
var changes = client.request('GET', "/TrackerNet/PredictionSummary/V", {
	'Content-Type' : 'text/xml'
});
changes.end();

changes.on('response', function(response) {
	if(response.statusCode != 200) {
		throw "response: " + response.statusCode;
	}

	var body = "";

	response.setEncoding('utf8');
	response.on('data', function(chunk) {
		body += chunk;
	});

	response.on('end', function() {
		domjs.parse(body.replace(/^\uFEFF/, ''), function(err, dom) {
				util.puts("serializes to : " + dom.toXml());
				
		});
	});
});
