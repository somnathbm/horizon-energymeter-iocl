
// only for user authentication and/or home creation purpose

  var loopback = require('loopback');
  var MongoClient = require('mongodb').MongoClient;
  var assert = require('assert');
  // Twilio Authy
  var authy = require('authy')('yV4u9wS5Iai0Eru6TChFpFcADO0dgdLZ');

  var app = loopback();
  // connection string
  var url = "mongodb://admin:ITUJOJDQCLVKPMNQ@sl-us-dal-9-portal.4.dblayer.com:17915/admin?ssl=true";

  // owner exists or verify checking
  app.get('/api/v1/owners/:id', function(req, res){
  	var ownerIdVal = req.params.id;

  	// connect to the server
  	MongoClient.connect(url, {uri_decode_auth: true}, function(err, db){
  		assert.equal(null, err);

  		// set the collection
      var col = db.collection('home');

      /** Our target is not only to check whether the ownerid exists but also whether the owner has any home(s) */
      /** so we are checking whether the supplied ownerid has any home(s) or not **/
      /** if DOES, then we are sure about 2 things: the ownerid already exists and it has one or more home(s) **/

      col.find({ownerId: ownerIdVal}, {homeId: 1, homeName: 1, ownerId: 1})
        .toArray()
        .then(function(doc){
          if(doc.length > 0){
            var customResp = {};
            customResp['homeData'] = [];

            for(var d of doc){
              customResp['ownerId'] == undefined?customResp['ownerId'] = d.ownerId:"";
              customResp['homeData'].push({homeId: d.homeId, homeName: d.homeName});
            }
            res.json(customResp);
          }
          else
            res.json(null);
        })
        .catch(function(err){
          res.json(err);
        });
  	});
  });

  // verify owner phone
  app.post('/api/v1/ownerphonecheck', function(req, res){
  	// extract the phone data
  	var ownerPhoneVal = req.body.phone;
  	var ownerPhoneCCode = req.body.ccode;

  	// Step1 : check against mongo
  	// connect to the MongoDB
  	MongoClient.connect(url, {uri_decode_auth: true}, function(err, db){
  		assert.equal(null, err);

      // set collection
  		var col = db.collection('owner');

  		// check if the requested phone number exists or not
  		col.findOne({ownerPhone: ownerPhoneVal})
  			.then(function(doc){
  				// Step2 : start phone verification process

  				authy.phones().verification_start(ownerPhoneVal, ownerPhoneCCode, {via: 'sms', locale: 'en'}, function(err, res3){
  					res.json(res3);
  				});
  			})
  			.catch(function(err){
  				res.json(err);
  			});
  	});
  });

  // verify check
  app.post('/api/v1/ownerphoneverifycheck', function(req, res){
  	// extract the phone data
  	var ownerPhoneNum = req.body.phoneNum;
  	var countryCode = req.body.phoneCC;
  	var verifyCode = req.body.verifyCode;

  	// connect to the MongoDB
  	MongoClient.connect(url, {uri_decode_auth: true}, function(err, db){
  		assert.equal(null, err);

  		var doc = db.collection('owner');

  		// check if the requested ownerID exists
  		doc.findOne({ownerPhone: ownerPhoneNum})
  			.then(function(doc){
  				authy.phones().verification_check(ownerPhoneNum, countryCode, verifyCode, function(err, res4){
  					res.json(res4);
  				});
  			})
  			.catch(function(err){
  				res.json(err);
  			});
  	});
  });

  // complete owner signup process
  app.post('/api/v1/signupcomplete', function(req, res){
      var ownerData = req.body.ownerData;
      var homeData = req.body.homeData;

      // connect to the MongoDB
      MongoClient.connect(url, {uri_decode_auth: true}, function(err, db){
        assert.equal(null, err);

        var doc1 = db.collection('owner');
        var doc2 = db.collection('home');

        // insert data to the owner collection
        doc1.insertOne(ownerData)
        .then(function(r1){
          // insert data to the home collection
          doc2.insertOne(homeData)
          .then(function(r2){
            res.json({success: true});
          })
          .catch(function(err){
            res.json(err);
          });
        })
        .catch(function(err){
          res.json(err);
        });
      });
  });

  // GET /homes
  app.get('/api/v1/homes', function(req, res){
  	var ownerId = req.query.ownerid;

  	// connect to the MongoDB
  	MongoClient.connect(url, {uri_decode_auth: true}, function(err, db){
  		assert.equal(null, err);

  		// insert some owner data
  		var doc = db.collection('home');

  		// check if the requested ownerID exists
  		doc.findOne({ownerId: ownerId})
  			.then(function(doc){
  				res.json(doc);
  			})
  			.catch(function(err){
  				res.json(err);
  			});
  	});
  });

  // get the rooms associated with the home for the owner
  app.get('/api/v1/rooms', function(req, res){
  	// extract the homeID
  	var homeIdVal = req.query.homeid;

  	// connect to the MongoDB
  	MongoClient.connect(url, {uri_decode_auth: true}, function(err, db){
  		assert.equal(null, err);

  		// set the collection
  		var doc = db.collection('room');

  		// check if the requested ownerID exists
  		doc.find({homeid: homeIdVal})
  			.toArray()
  			.then(function(doc){
  				res.json(doc);
  			})
  			.catch(function(err){
  				res.json(err);
  			});
  	});
  });

module.exports = app;

