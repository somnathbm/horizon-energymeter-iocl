
exports.sendLightData = function(appClient, deviceId){
	return function(req, res){
		var response = req.body.L;
		console.log(response);
		
		//demo data to send
		var myData = { 'name': 'somnath', 'role':  'architect' };
		appClient.publishDeviceCommand("pi_cierra", deviceId, "status", "json", myData);

		res.send("request received & processed");
	};
};
