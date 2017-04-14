var express = require('express');
var xml2js = require("xml2js");
var cfenv = require('cfenv');
var url = require('url');
var app = require('../app');
var request = require('request');
var router = express.Router();

//load local VCAP configuration
var vcapLocal = null;
try {
	vcapLocal = require("../vcap-local.json");
	console.log("Loaded local VCAP", vcapLocal);
} catch (e) {
	console.error(e);
}

//Get app variables from Bluemix, defaulting to local VCAP
var appEnvOpts = vcapLocal ? {
	vcap: vcapLocal
} : {};
var appEnv = cfenv.getAppEnv(appEnvOpts);

//Set up objects to talk to API Management
//var orangeCreds = appEnv.getServiceCreds("orange-m2m")
console.log(appEnv.getServices())
var orangeCreds = appEnv.getServiceCreds("TestOrangeIoT")
console.log(orangeCreds)

var options = {
	method: 'POST',
	url: orangeCreds.url,
	qs: {
		client_id: orangeCreds.client_id
	},
	headers: {
		authorization: 'Basic T1JBTkdFX09QRU5fQVBJLTJmOTBmNjJiYjQ5MGRhNTU5MDBlZDI1NzgyNmZlOighS1k2WjVx',
		'content-type': 'text/xml;charset=UTF-8'
	}
}


//-------------------------------------------------------------
//GET Devices in JSON
//Calling API Management
//-------------------------------------------------------------
router.get('/devices/:id', function (req, res) {
	console.log('Calling endpoint: ' + req.params.id)

	// Construct SOAP Envelopper with SIM Number
	var simNb = req.params.id;
	getCDSoapRequest(simNb, function (soapEnv) {
		//console.log(soapEnv);
		options['body'] = soapEnv
	});

	request(options, function (error, response, body) {
		if (error) throw new Error(error)
		//console.log("@@@" + body) // If HTTP request OK, body contains XML response

		var parseString = xml2js.parseString;

		// explicitArray (default: true): Always put child nodes in an array if true;
		//                                otherwise an array is created only if there is more than one.
		// ignoreAttrs  (default: false): Ignore all XML attributes and only create text nodes.
		parseString(body, {
			explicitArray: false,
			ignoreAttrs: true
		}, function (err, result) {
			var jsonData = result['soap:Envelope']['soap:Body']['ns3:getConnectivityDirectoryResponse']
			var str = JSON.stringify(jsonData, null, 4)

			// Remove the namespace from each attribute
			var result = str.replace(/ns[0-9]:/g, '')
			//console.log('>>> Endpoint response:\n' + result)

			var jsonResponse = JSON.parse(result)
			res.send(jsonResponse.connectivityDirectory)
			//console.log("\nSIM Status=" + jsonResponse.connectivityDirectory.sim.status)
		});
	});

});

//-------------------------------------------------------------
//GET All Connectivty Directory in JSON
//Calling directly Orange API
//-------------------------------------------------------------
router.get('/devices', function (req, res) {
	var options = {
			method: 'POST',
			url: 'https://iosw-ba.orange.com:443/MLM_EXT_IMC/ConnectivityDirectory-1',
			headers: {
				'postman-token': 'ad4567b5-3d71-6916-3c5b-ee0327e4bd73',
				'cache-control': 'no-cache',
				authorization: 'Basic T1JBTkdFX09QRU5fQVBJLTJmOTBmNjJiYjQ5MGRhNTU5MDBlZDI1NzgyNmZlOighS1k2WjVx',
				'content-type': 'text/xml;charset=UTF-8'
			},
			body: '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" \nxmlns:v1="http://webservice.malima.francetelecom.com/v1" \nxmlns:con="http://connectivityDirectory.types.malima.francetelecom.com" \nxmlns:com="http://common.types.malima.francetelecom.com">\n   <soapenv:Header/>\n   <soapenv:Body>\n      <v1:searchInConnectivityDirectory>\n      </v1:searchInConnectivityDirectory>\n   </soapenv:Body>\n</soapenv:Envelope>'
	};

	request(options, function (error, response, body) {
		if (error) throw new Error(error);

		var parseString = xml2js.parseString;

		// explicitArray (default: true): Always put child nodes in an array if true;
		//                                otherwise an array is created only if there is more than one.
		// ignoreAttrs  (default: false): Ignore all XML attributes and only create text nodes.
		parseString(body, {
			explicitArray: false,
			ignoreAttrs: true
		}, function (err, result) {
			var jsonData = result['soap:Envelope']['soap:Body']['ns2:searchInConnectivityDirectoryResponse']
			var str = JSON.stringify(jsonData, null, 4)

			// Remove the namespace from each attribute
			var result = str.replace(/ns[0-9]:/g, '')
			//console.log('>>> Endpoint response:\n' + result)

			var jsonResponse = JSON.parse(result)
			//res.send(jsonResponse.connectivityDirectory)
			// return only the information needed, further details can be retrieved with /devices/:id

			var staticLocations = {}
			staticLocations["2310300471761"] = {
				city: "Barcelona",
				lat: 41.385064,
				lon: 2.173403
			}

			staticLocations["2310300471779"] = {
				city: "Paris",
				lat: 41.385064,
				lon: 2.173403
			}
			staticLocations["2320300295664"] = {
				city: "Bruxelles",
				lat: 41.385064,
				lon: 2.173403
			}
			staticLocations["2413600000023"] = {
				city: "Munich",
				lat: 41.385064,
				lon: 2.173403
			}
			staticLocations["2413600004488"] = {
				city: "Rome",
				lat: 41.385064,
				lon: 2.173403
			}
			staticLocations["2413600004371"] = {
				city: "London",
				lat: 41.385064,
				lon: 2.173403
			}
			staticLocations["2413600004355"] = {
				city: "Madrid",
				lat: 41.385064,
				lon: 2.173403
			}
			staticLocations["2413600004348"] = {
				city: "Zurich",
				lat: 41.385064,
				lon: 2.173403
			}
			staticLocations["2413600004272"] = {
				city: "Amsterdam",
				lat: 41.385064,
				lon: 2.173403
			}
			staticLocations["2120300465493"] = {
				city: "Montpellier",
				lat: 41.385064,
				lon: 2.173403
			}


			res.send(jsonResponse.connectivityDirectory.map(function (value) {

				var simLocation
				if (staticLocations.hasOwnProperty(value.sim.serialNumber)) {
					simLocation = staticLocations[value.sim.serialNumber];
				} else {
					simLocation = {
							city: "Paris",
							lat: 48.787176,
							lon: 2.219097
					};
				}

				return {
					sim: {
						serialNumber: value.sim.serialNumber,
						status: value.sim.status,
						location: simLocation
					}
				}
			}));

		});

	});
});

var soapEnvBegin =
	'<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" ' +
	'\nxmlns:v1="http://webservice.malima.francetelecom.com/v1" ' +
	'\nxmlns:con="http://connectivityDirectory.types.malima.francetelecom.com" ' +
	'\nxmlns:com="http://common.types.malima.francetelecom.com">\n ' +
	'   <soapenv:Header/>\n ' +
	'   <soapenv:Body>\n ';
var soapEnvEnd =
	'   </soapenv:Body>\n' +
	'</soapenv:Envelope>';

function getCDSoapRequest(simNb, cb) {
	var soapBody =
		'       <v1:getConnectivityDirectory>\n ' +
		'           <con:lineIdentifiers>\n ' +
		'               <com:simSerialNumber>' +
		simNb + '</com:simSerialNumber>\n ' +
		'           </con:lineIdentifiers>\n ' +
		'       </v1:getConnectivityDirectory>\n ';

	var soapEnv = soapEnvBegin + soapBody + soapEnvEnd;
	cb(soapEnv);
}

module.exports = router;
