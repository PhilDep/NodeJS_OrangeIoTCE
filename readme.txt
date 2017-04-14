

IOTF
----
  Organization ID      : 824xjw
  Device Type          : GasMonitor
  Device ID            : 16010001
  Authentication Method: token
  Authentication Token : Ijj(SnXkpWqu1YW7Jv

REAL
{ "topic": "iot-2/type/GasMonitor/id/16010001/evt/status/fmt/json", "payload": { "gasValue": 168 }, "deviceId": "16010001", "deviceType": "GasMonitor", "eventType": "status", "format": "json", "_msgid": "5472fcdd.ab8d04" }

API Key:
  API Key a-824xjw-sokxleztw6
  API Token nDECzIIix5jV3KoZlU


Pre-requisites
--------------
* Service: IOT Foundation
* Service: API Management with Orange M2M API imported and deployed into Bluemix Private Catalog
* Application NodeRed

To run the demo
------------------
* To simulate Orange M2M APIs, you can import the file orange-apis-postman.json into Postman (www.getpostman.com)
* To run this this project locally on this machine, copy your local vcap into the file vcap-local.json

Todo
-------
* use .config/vcap.js to reuse
. Once Datapower bug is fixed in prod, change m2m.js code to make a call to APIM instead of direct call.


History
-------

V2 - 2016-02-01
---------------
Major change:
* added realtime Gas value in UI Dashboard thanks to Web Socker

Minor changes:
* replaced websocket url wss by ws
* added iotf-service credentials in vcap-local.json
* updated index.html to load <script src="js/websocket.js" />
* updated dashboard.html to load gas value.

V1 - 2016-01-25
---------------
* First version published into Orange Bluemix Organization
* UI built with Angular and Bootstrap dashboard
* Connection to Orange M2M API works ok with direct call to Orange endpoint.