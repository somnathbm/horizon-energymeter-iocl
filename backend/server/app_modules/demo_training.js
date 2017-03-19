
// demo app for training

var loopback    = require('loopback'),
    MongoClient = require('mongodb').MongoClient,
    assert      = require('assert'),
    Client      = require('ibmiotf'),
    app         = loopback(),
    Twilio      = require('twilio'),
    url         = "mongodb://admin:ITUJOJDQCLVKPMNQ@sl-us-dal-9-portal.4.dblayer.com:17915/admin?ssl=true",
    payload2 = {};

    module.exports.payload = payload2;

    // IBM Watson IoT appclient config
    var appClientConfig = {
        "org": "vof6x6",
        "id": "56ce73ec-566c-442a-8561-62f854e0322a",
        "domain": "internetofthings.ibmcloud.com",
        "type": "shared",
        "auth-method": "apikey",
        "auth-key": "a-vof6x6-kshpmeuchf",
        "auth-token": "*q4@c?OchYxd?&z98n"
    };

/* -+++++++++++++++++++++++++++ IoT starts here ++++++++++++++++++++- */
    var appClient = new Client.IotfApplication(appClientConfig);
    appClient.connect();

    appClient.on("connect", function(){
        console.log("app connect event triggered!");
        // subscribe to device events
        appClient.subscribeToDeviceEvents("ESP12E_1");
       	// subscribe to device status
        appClient.subscribeToDeviceStatus("ESP12E_1");
    });

    appClient.on("error", function(err){
        console.log("App connect error: " + err);
    });

    // receive from IoT Foundation platform
    appClient.on("deviceEvent", function (deviceType, deviceId, eventType, format, payload) {
      payload2 = JSON.parse(payload);

      if(Object.keys(payload2.d).indexOf("danger") != -1 && payload2.d.danger == "1"){
        sendSOSText();
      }
    });
/* -+++++++++++++++++++++++++++ IoT ends here ++++++++++++++++++++++- */

// switching on/off -or- value control for both LED and fan
app.post('/api/v1/demo/appliances/:id', function(req, res){
  // extract supplied data
  var applianceId = req.params.id,
      updateObj = {},
      commandData = {};

  if(req.body.state != (undefined || null)){
    commandData['value'] = (req.body.state == true)?100:0;
    updateObj['state'] = req.body.state;
  }
  else if(req.body.value != (undefined || null)){
    commandData['value'] = updateObj['value.current'] = req.body.value;
  }

  // now, this data needs to be forwarded to IBM IoT Foundation platform
  commandData["applianceid"] = applianceId;
  commandData = JSON.stringify(commandData);

  console.log("-=-=-=-=-=-=-=-=-=-=-");
  console.log("Data being sent to hardware :");
  console.log(commandData);

  console.log("Data being sent to DB :");
  console.log(JSON.stringify(updateObj));
  console.log("-=-=-=-=-=-=-=-=-=-=-");

  // forward this data
  appClient.publishDeviceCommand("ESP12E_1", "5ccf7f23d91e", "command", "json", commandData);

  setTimeout(function(){
    console.log("Hardware response: ");
    console.log(payload2);

    if(payload2.d.response == "1"){
      // means hardware level operation was SUCCESS
      // process database calls now
      // connect to db
      MongoClient.connect(url, {uri_decode_auth: true}, function(err, db){
        // point to collection
        var store = db.collection('demo');

        // update the requested appliance
        store.updateOne({"applianceTypeId": applianceId}, {$set: updateObj})
          .then(function(r){
            res.json(r);
          })
          .catch(function(err){
            res.json(err);
          });
      });
    }
    else{
      // hardware operation failed
      res.send({msg:"hardware fail"});
    }
  }, 500);
});

// fetching appliances
app.get('/api/v1/demo/appliances', function(req, res){
  // connect to db
  MongoClient.connect(url, {uri_decode_auth: true}, function(err, db){
    // point to collection
    var store = db.collection('demo');

    // find all the appliances
    store.find()
      .toArray()
      .then(function(docs){
        res.json(docs);
      })
      .catch(function(err){
        res.json(err);
      });
  });
});

// send SOS msg
app.get('/api/v1/demo/sos', function(req, res){
  sendSOSText(res);
});

// send SOS message to a already selected phone number using Twilio
function sendSOSText(res){
  // Twilio credential
  var accountSID = "AC4fe1f99bbbb8e965610ea8c1f78ecfc7",
      authToken  = "5037a573d0562b8fe5e1d21430d051eb";

  //require the Twilio module and create a REST client
  var twilioClient = Twilio(accountSID, authToken);

  twilioClient.messages.create({
    to  : "+919614755427",
    from: "+19285506642 ",
    body: "I am in danger. Please help. Hurry."
  }, function(error, message){
    res != (undefined || null)?res.json(message):"";
  });
}

module.exports = app;

