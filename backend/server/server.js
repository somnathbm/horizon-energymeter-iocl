
/* @@@@@ all the required modules */
var loopback     = require('loopback'),
		boot         = require('loopback-boot'),
		helmet       = require('helmet'),
		errorHandler = require('strong-error-handler'),
		bodyParser   = require('body-parser'),
		imf          = require('bms-mca-oauth-sdk'),
		Client       = require('ibmiotf'),
		mongoClient  = require('mongodb').MongoClient,
		https        = require('https'),

/* all the global scoped variables for this app */
		gSocket,
		sensorData = {},
		evtWatcher = 0,
		dbURL = 'mongodb://admin:DIMRIIXPEDBLZMJQ@sl-us-dal-9-portal.5.dblayer.com:20457/admin?ssl=true';
		//queryData = [];

var app = module.exports = loopback();
app.use(helmet());
app.use(errorHandler({debug:true, log:true}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// IBM Watson IoT appclient config
var appClientConfig = {
		"org": "o0olpf",
		"id": "b2fa3171-c88a-49f3-9bb9-f694374beef1",
		"domain": "internetofthings.ibmcloud.com",
		"type": "shared",
		"auth-method": "apikey",
		"auth-key": "a-o0olpf-aanojiili8",
		"auth-token": "EFX)qG-b)Km3ZI5f74"
};

/* -+++++++++++++++++++++++++++ IoT starts here ++++++++++++++++++++- */
var appClient = new Client.IotfApplication(appClientConfig);
appClient.connect();

appClient.on("connect", function(){
		console.log("app connect event triggered!");
		appClient.subscribeToDeviceEvents("servo1");
		appClient.subscribeToDeviceStatus("servo1");
});

appClient.on("error", function(err){
		console.log("App connect error: " + err);
});

// receive from IoT Foundation platform
appClient.on("deviceEvent", function (deviceType, deviceId, eventType, format, payload) {
	evtWatcher = 0;
	sensorData = JSON.parse(payload).d;
	console.log("device data: " + payload);

	setTimeout(function(){
		if(typeof sensorData != 'undefined' && typeof gSocket != 'undefined' && Object.keys(sensorData).indexOf('serial') != -1){

			var meterData = {servo_no: sensorData.serial, input_voltage: {ivr: sensorData.vri, ivy: sensorData.vyi, ivb: sensorData.vbi}, output_voltage: {ovr: sensorData.vro, ovy: sensorData.vyo, ovb: sensorData.vbo}, output_current: {ocr: sensorData.ir, ocy: sensorData.iy, ocb: sensorData.ib}};

			// add current timestamp field to this object
			meterData['recorded_on'] = Date.now();
			
			// send the data to the DB
			mongoClient.connect(dbURL, {uri_decode_auth: true}, function(err, db){
				// point to collection
				var store = db.collection('meterdata');

				store.insertOne(meterData)
				  .then(function(r){
				  	console.log('inserted: true');
				  })
				  .catch(function(err){
				  	console.log('failed to insert data');
				  });
			});

			gSocket.emit('sensordata', meterData);
		}
	}, 1000);
});
/* -+++++++++++++++++++++++++++ IoT ends here ++++++++++++++++++++++- */

////////////////// routing //////////////////
app.post('/api/v1/energydata', function(req, res){
	var timestampData = req.body.payload;

	// loop to retrieve data on basis of payload
	fetchData(timestampData, res);
});

// fetch remote DB data
function fetchData(data, resp){

	var srcTime        = data.timestamps[0],
	    targetTime     = data.timestamps[1],
	    duration       = data.duration/60000,
	    requested_type = data.request_for,
	    servo          = data.servo_no;
	    criteria       = data.criteria,
	    projection = {};

	projection['servo_no'] = 1;
	projection[requested_type] = 1;
	projection['recorded_on'] = 1;

	//var queryData = [];

	// connect to the remote db
	// mongoClient.connect(dbURL, {uri_decode_auth: true}, function(err, db){
	// 	// point to the target collection
	// 	var col = db.collection('meterdata');

	// 	col.find({'servo_no': data.servo_no, 'recorded_on': {$gte: srcTime, $lte: targetTime}}, projection)
	// 		.toArray()
	// 		.then(function(docs){
	// 			var resultSize = docs.length;
	// 			var criteriaInMinutes = criteria/60000;
	// 			var loopLength = resultSize/criteriaInMinutes;  // USE SAFEGUARD HERE
	// 			var filteredArr = [docs[0]];

	// 			// push the first item in the array
	// 			for(var i=1, j=0; i<=loopLength; i++){
	// 				filteredArr.push(docs[j + (criteriaInMinutes-1)]);  // access it first
	// 				j += criteriaInMinutes; // j becomes 10
	// 			}

	// 			// organise data as required by Chart.js on the front-end
	// 			resp.json({result: filteredArr});
	// 		})
	// 		.catch(function(err){
	// 		  	console.log(err);
	// 		});
	// });

	//////////////////////////// MODIFIED - EXPERIMENTAL ///////////////
	mongoClient.connect(dbURL, {uri_decode_auth: true})
	  .then(function(err, db){
	  	// point to the target collection
		var col = db.collection('meterdata');

		col.find({'servo_no': servo, 'recorded_on': {$gte: srcTime, $lte: targetTime}}, projection)
		  .toArray()
		  .then(function(docs){
		  	// expected size of the array
		  	var expected_size = duration;
		  	// actual size of the array
		  	var actual_size = docs.length;

		  	// my crieria or interval of time i wanted to show value in the chart. here it is 10 minutes
		  	var criteriaInMinutes = criteria/60000;

		  	// just an array to hold the sorted array
		  	var sorted_arr = [];

		  	if(actual_size == expected_size){
		  		// find the loop length
		  		var loopLength = actual_size/10;

		  		// store the 0th index's value to the sorted array
		  		sorted_arr.push(docs[0]);

		  		// loop through 1 to n and push next 10th index's value into the sorted array
		  		for(var i=1, j=0; i<loopLength; i++){
		  			sorted_arr.push(docs[j + (criteriaInMinutes-1)]); // access it first
		  			j += criteriaInMinutes; // j becomes 10
		  		}

		  		// do the next task from hereon
		  		organiseForChart(sorted_arr, resp);
		  	}
		  	else{
		  		// calculate difference between expected and actual size of the array
		  		var difference = expected_size - actual_size;

		  		// check if actual size of the array modulo criteria produces any remainder
		  		if(actual_size % criteriaInMinutes != 0){
		  			difference += (actual_size % criteriaInMinutes);
		  		}

		  		// store the 0th index's value to the sorted array
		  		sorted_arr.push(docs[0]);

		  		// loop through 1 to actual size and push next 10th index's value into sorted array
		  		for(var i=1, j=0; i<actual_size; i++){
		  			sorted_arr.push(docs[j + (criteriaInMinutes-1)]); // access it first
		  			j += criteriaInMinutes; // j becomes 10
		  		}

		  		// we now have to fill the remaining values with zeros
		  		// modified difference length
		  		var fillWithZeroLoopLength = difference / 10;

		  		for(var k=0; k<fillWithZeroLoopLength; k++){
		  			sorted_arr.push({timestamps: null});
		  		}

		  		// do the next task from hereon
		  		organiseForChart(sorted_arr, resp);
		  	}
		  })
		  .catch(function(err){
		  	console.log(err);
		  });
	  });
	///////////////////////////////////////////////////////////////////////////////
}



// organise these data into a form which the Chart.js library expects
function organiseForChart(sorted_array, response){
	var rphaseArr = [],
	    yphaseArr = [],
	    bphaseArr = [],

	    rphaseObj = {},
	    yphaseObj = {},
	    bphaseObj = {},

	    chartDataArr = [],
	    mappedDateTimeArr = [];

	// loop through this array and decouple 3 phases seperately
	for(var i=0; i<sorted_array.length; i++){
		if(Object.keys(sorted_array[i]).length == 3){
			var targetDataObj = Object.keys(sorted_array[i])[1]; // {input_voltage: {}}
			var requiredPhaseArr = Object.keys(targetDataObj); // [ivr, ivy, ivb]


			// now simply take value from each one and put it into the respective array
			rphaseArr.push(targetDataObj.requiredPhaseArr[0]);
			yphaseArr.push(targetDataObj.requiredPhaseArr[1]);
			bphaseArr.push(targetDataObj.requiredPhaseArr[2]);

			// now we have to insert this array inside respective phase objects
			rphaseObj['data'].push(rphaseArr);
			rphaseObj['label'] = requiredPhaseArr[0].split("").reverse().join("");
			rphaseObj['fill'] = false;

			yphaseObj['data'].push(yphaseArr);
			yphaseObj['label'] = requiredPhaseArr[1].split("").reverse().join("");
			yphaseObj['fill'] = false;

			bphaseObj['data'].push(bphaseArr);
			bphaseObj['label'] = requiredPhaseArr[2].split("").reverse().join("");
			bphaseObj['fill'] = false;

			// retrieve the 3rd item to get the timestamp
			var tempTime = new Date(sorted_array[i]['recorded_on']);
			var tempHourHand = tempTime.getHours();
			var tempMinuteHand = tempTime.getMinutes();
			tempTime = {hours: tempHourHand, minutes: tempMinuteHand};
			mappedDateTimeArr.push(tempTime);
		}
		else if(Object.keys(sorted_array[i]).indexOf('timestamps') != -1){
			// fill with zeros
			rphaseObj['data'].push(0);
			yphaseObj['data'].push(0);
			bphaseObj['data'].push(0);
			mappedDateTimeArr.push({time: null});
		}
	}

	// required data for chart's magnitude on Y-axis
	chartDataArr.push(rphaseObj, yphaseObj, bphaseObj);

	// send the chart data (for Y-axis) and time data (for X-axis) to the front-end
	response.json({chartdata: chartDataArr, timedata: mappedDateTimeArr});
}


// OneSignal Notification API over REST
var sendNotification = function(data) {
	var headers = {
		"Content-Type": "application/json; charset=utf-8",
		"Authorization": "Basic Yjk1ZDgxMmUtZGM5Mi00MzZhLWFkNzgtMDA3MzAyMmFlNzQ0"
	};
		  
	var options = {
		host: "onesignal.com",
		port: 443,
		path: "/api/v1/notifications",
		method: "POST",
		headers: headers
	};
		  
	var https = require('https');
	var req = https.request(options, function(res) {  
		res.on('data', function(data) {
		    console.log("Response:");
		    console.log(JSON.parse(data));
		});
	});
		  
	req.on('error', function(e) {
		console.log("ERROR:");
		console.log(e);
	});
		  
	req.write(JSON.stringify(data));
	req.end();
};


// watch database and notify customer accordingly
function watchDB(){
	mongoClient.connect(dbURL, {uri_decode_auth: true})
	  .then(function(err, db){
	  	var col = db.collection('meterdata');

	  	col.find().skip(col.count()-5)
	  	  .toArray()
	  	  .then(function(docs){
	  	  	consol.log(docs.length);

	  	  	// call OneSignal Notification APi to send notification 
	  	  	//sendNotification();
	  	  })
	  	  .catch(function(err){
	  	  	console.log(err);
	  	  });
	  })
}


// intercept IoT events
function iotEventIntercepter(){
	evtWatcher++;

	console.log('counter value: ' + evtWatcher);

	if(typeof gSocket != 'undefined' && evtWatcher > 15){
		// emit socket event to trigger servo offline
		gSocket.emit('offline', {msg: 'connection offline'});
	}
}

setInterval(iotEventIntercepter, 1000);

//setInterval(watchDB, 1000);

////////////////////////////////////////////////////
app.start = function () {
	// start the web server
	return app.listen(function () {
		app.emit('started');
		var baseUrl = app.get('url').replace(/\/$/, '');
		console.log('Web server listening at: %s', baseUrl);
		var componentExplorer = app.get('loopback-component-explorer');
		if (componentExplorer) {
			console.log('Browse your REST API at %s%s', baseUrl, componentExplorer.mountPath);
		}

		//////////////////////////////////////////////////
		

		// var message = { 
		//   app_id: "8272f497-b2d9-48cc-99a8-89e620976345",
		//   contents: {"en": "Heil Hitler"},
		//   included_segments: ["All"]
		// };

		//sendNotification(message);
		//////////////////////////////////////////////////////////////////////////
	});
};

// Bootstrap the application, configure models, datasources and middleware.
// Sub-apps like REST API are mounted via boot scripts.
boot(app, __dirname, function (err) {
	if (err) throw err;
	if (require.main === module)
		//app.start();
		app.io = require('socket.io')(app.start());
		app.io.on('connection', function(socket){
			gSocket = socket;
			console.log('user connected...');

			// ////////////////////////////
			// var meterData = {servo_no: 1, input_voltage: {ivr: '7.23', ivy: '9.34', ivb: '12.45'}, output_voltage: {ovr: '23.35', ovy: '21.67', ovb: '20.90'}, output_current: {ocr: '15.67', ocy: '29.56', ocb: '18.45'}};

			// // add current timestamp field to this object
			// meterData['recorded_on'] = Date.now();

			// // send the data to the DB
			// mongoClient.connect(dbURL, {uri_decode_auth: true}, function(err, db){
			// 	// point to collection
			// 	var store = db.collection('meterdata');

			// 	store.insertOne(meterData)
			// 	  .then(function(r){
			// 	  	console.log('inserted: true');
			// 	  })
			// 	  .catch(function(err){
			// 	  	console.log('failed to insert data');
			// 	  });
			// });

			// ////////////////////////////////////
			// gSocket.emit('sensordata2', meterData);



			socket.on('disconnect', function(){
				console.log('user disconnected');
				gSocket.emit('offline', {msg: 'connection offline'});
			});
		})
});

