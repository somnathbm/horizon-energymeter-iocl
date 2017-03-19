
// for IoT

// IBM IoT foundation
//var Client = require('ibmiotf');

// IBM Watson IoT appclient config
// var appClientConfig = {
//     "org": "7blv9r",
//     "id": "28dc00d0-b0d7-4146-afd0-670523ec823c",
//     "domain": "internetofthings.ibmcloud.com",
//     "auth-method": "apikey",
//     "type": "shared",
//     "auth-key": "a-7blv9r-rfzzcakwvh",
//     "auth-token": "-lt86oxLQf4cCfVwO_"
// };

//var appClient = new Client.IotfApplication(appClientConfig);
//appClient.connect();

// appClient.on("connect", function(){
//     console.log("app connect event triggered!");
//     // subscribe to device events
//     appClient.subscribeToDeviceEvents("pi_tiktok");
//    	// subscribe to device status
//     appClient.subscribeToDeviceStatus("pi_tiktok");
// });

// appClient.on("error", function(err){
//     console.log("App Error: " + err);
// });

// --------------- IoT ends here -------------------------------------

// Protect /protected endpoint which is used in Getting Started with Bluemix Mobile Services tutorials
// app.post('/api/clients', function(req, res){
// 	console.log("Payload: " + req.body.L);

// 	//demo data to send
// 	var myData = { 'name': 'somnath', 'role':  'architect' };
// 	appClient.publishDeviceCommand("pi_tiktok", "homeTiktok", "status", "json", myData);

// 	res.send("Hello, this is a protected resouce of the mobile backend application!");
// });

