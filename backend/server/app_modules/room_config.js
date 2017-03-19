
// room configuration related routes

var loopback = require('loopback');
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');

var app = loopback();
/** connection string **/
var url = "mongodb://admin:ITUJOJDQCLVKPMNQ@sl-us-dal-9-portal.4.dblayer.com:17915/admin?ssl=true";

// list all sort of appliances for new_room.ts
app.get('/api/v1/appliances/lists', function(req, res){
	// connect to the MongoDB
	MongoClient.connect(url, {uri_decode_auth: true}, function(err, db){
		assert.equal(null, err);

		// set the collection
		var col = db.collection('roomconfig');

		// find only the root appliance category information and meta properties
		col.find({}, {applianceCollection: 0})
			.toArray()
			.then(function(docs){
				res.json(docs);
			})
			.catch(function(err){
				res.json(err);
			});
	});
});

// hybrid appliance select view
app.get('/api/v1/appliances', function(req, res){
	// extract the query params
	var reqType = req.query.type;
	var ownerHomeId = req.query.homeid;
	var currentRoom = req.query.room;


	// connect to the MongoDB
	MongoClient.connect(url, {uri_decode_auth: true}, function(err, db){
		// set the collection
	  var store1 = db.collection('roomconfig');
	  var store2 = db.collection('appliance');

		if(req.query.catg != undefined){
				// if query params contain category information
				var catgType = req.query.catg;
				store1.findOne({"applianceType": reqType, "applianceCollection.category": catgType}, {"applianceCollection.$.items": 1})
					.then(function(docs){
						var data = docs.applianceCollection[0].items;

						/////////////////////////////////////////////////////////////////////////////////////
						var listView = false;
						if(data.length > 0){
							for(var d of data){
								if(d.homename == ownerHomeId){
									if(d.homedata.length > 0){
										for(var h of d.homedata){
											if(h.roomname == currentRoom){
												listView = true;
												break;
											}
										}
									}
									else{
										listView = true;
									}
									break;
								}
							}

							if(listView){
								// get all the appliances
								var allAppliancesList;
								var existingAppliancesList;

								// fetch all appliances of requested type
								store2.find({"rootCatg": reqType})
											.toArray()
											.then(function(docs){
												allAppliancesList = docs;
											})
											.catch(function(err){
											});

								// now, fetch all those already selected appliances
								store1.findOne({"applianceType": reqType, "applianceCollection.category": catgType, "applianceCollection.items.homename": ownerHomeId}, {"applianceCollection.$.items.homedata": 1})
											.then(function(docs){
												existingAppliancesList = (docs.applianceCollection[0].items[0].homedata.length > 0 && Object.keys(docs.applianceCollection[0].items[0].homedata[0]).indexOf('roomdata') != -1)?docs.applianceCollection[0].homedata[0].roomdata:docs.applianceCollection[0].homedata;

												// compare both arrays
												for(var a of allAppliancesList){
													for(var e of existingAppliancesList){
														if(a.name == e.name){
															a['inUsed'] = true;
															break;
														}
														else{
															a['inUsed'] = false;
														}
													}
													a.inUsed == (undefined || null)?a['inUsed'] = false:"";
												}

												// send the final response back
												var finalResponse = {};
												finalResponse['applView'] = 'list';
												finalResponse['applData'] = allAppliancesList;
												res.json(finalResponse);
											})
											.catch(function(err){
												res.json(err);
											});
							}
						}
						else{
							// if applianceCollection is empty i.e. neither it contains any client data nor has category
							store2.find({"rootCatg": reqType})
			        	.toArray()
			        	.then(function(docs){
			        		var temp = {};
			        		temp['applView'] = 'list';
			        		temp['applData'] = docs;
			        		res.json(temp);
			        	})
			        	.catch(function(err){
			        		res.json(err);
			        	});
						}
						////////////////////////////////////////////////////////////////////////////////////
					})
					.catch(function(err){
						res.json(err);
					});
		}
		else{
			// otherwise
			// check if the requested ownerhomeID & currentroom -OR- category & items exists
		  store1.findOne({"applianceType": reqType}, {"applianceCollection": 1})
				.then(function(docs){
					var data = docs.applianceCollection;

					if(data.length > 0){
						// if applianceCollection contains some data
						// we need to check if appliancecolletion contains any category data
						// its an array, so if its first index contains it then we will know for sure that category exists
						if(Object.keys(data[0]).indexOf("category") != -1 && Object.keys(data[0]).indexOf("items") != -1){

							for(var d of data){
								if(d.items.length > 0){
									// iterate over `items` array only if there were already some data
					        for(var i of d.items){
					          if(i.homename == ownerHomeId){
					        		if(i.homedata.length > 0){
												for(var h of i.homedata){
													if(h.roomname == currentRoom){
														d.items = h.roomdata.length;
														break;
													}
												}
											}
					        		else{
													d.items = 0;
											}
											break;
										}
					      	}
								}
								else{
									// otherwise, fallback to zero - default
					        d.items = 0;
								}
							}

							// send the final response back
							var temp = {};
			        temp['applView'] = 'catg';
			        temp['applData'] = data;
			        res.json(temp);
						}
						else{
							var listView = false;
							for(var d of data){
								if(d.homename == ownerHomeId){
									if(d.homedata.length > 0){
										for(var h of d.homedata){
											if(h.roomname == currentRoom){
												listView = true;
												break;
											}
										}
									}
									else{
										listView = true;
									}
									break;
								}
							}
							if(listView){
								// get all the appliances
				        var allAppliancesList;
				      	var existingAppliancesList;

								// fetch all appliances of requested type
								store2.find({"rootCatg": reqType})
				        			.toArray()
				        		 	.then(function(docs){
				        				allAppliancesList = docs;
				        		 	})
				        		 	.catch(function(err){
				        		 	});

								// now, fetch all those already selected appliances
				        store1.findOne({"applianceType": reqType, "applianceCollection.homename": ownerHomeId}, {"applianceCollection.homedata": 1})
				        			.then(function(docs){
												existingAppliancesList = (docs.applianceCollection[0].homedata.length > 0 && Object.keys(docs.applianceCollection[0].homedata[0]).indexOf('roomdata') != -1)?docs.applianceCollection[0].homedata[0].roomdata:docs.applianceCollection[0].homedata;

												// compare both arrays
												for(var a of allAppliancesList){
													for(var e of existingAppliancesList){
														if(a.name == e.name){
															a['inUsed'] = true;
															break;
														}
														else{
															a['inUsed'] = false;
														}
													}
													a.inUsed == (undefined || null)?a['inUsed'] = false:"";
												}

												// send the final response back
												var finalResponse = {};
								        finalResponse['applView'] = 'list';
								        finalResponse['applData'] = allAppliancesList;
												res.json(finalResponse);
				        			})
				        			.catch(function(err){
				        				res.json(err);
				        			});
							}
						}
					}
					else{
						// if applianceCollection is empty i.e. neither it contains any client data nor has category
						store2.find({"rootCatg": reqType})
		        	.toArray()
		        	.then(function(docs){
		        		var temp = {};
		        		temp['applView'] = 'list';
		        		temp['applData'] = docs;
		        		res.json(temp);
		        	})
		        	.catch(function(err){
		        		res.json(err);
		        	});
					}
				})
				.catch(function(err){
					res.json(err);
				});
		}
	});
});


// get all the appliances for the requested category or sub-category
app.get('/api/v1/appliances/detail', function(req, res){
	// extract the requested categories
	var catg = req.query.catg;

	// connect to the MongoDB
	MongoClient.connect(url, {uri_decode_auth: true}, function(err, db){
		assert.equal(null, err);

		// set the collection
		var doc = db.collection('appliance');

		// check if the requested ownerID exists
		doc.find({"subCatg": catg})
			.toArray()
			.then(function(docs){
				res.json(docs);
			})
			.catch(function(err){
				res.json(err);
			});
	});
});


//
app.post('/api/v1/appliances/update', function(req, res){
	// extract the payload
	var ownerhomeid = req.body.homeid;
	var roomname = req.body.roomname;
	var applianceData = req.body.appliancedata; // actual appliance config data
	var applianceType = req.body.appliancetype; // type of appliance this appliancedata is for

	// if appliance has category
	if(req.body.catg != undefined){
		var catg = req.body.catg;

		  // connect to the MongoDB
		  MongoClient.connect(url, {uri_decode_auth: true}, function(err, db){
				assert.equal(null, err);

		    // set the collection
		    var col = db.collection('roomconfig');

		    // step1# first check for the existance of the <homeid> key and its <roomname> key
		    // if exists, then decouple the payload to only contain the value of room
		    // if does not, then push it as it is

			});
	}
	else{ // if appliance has no category e.g. fan
		// connect to the MongoDB
		MongoClient.connect(url, {uri_decode_auth: true}, function(err, db){
			assert.equal(null, err);

			// set the collection
			var store = db.collection('roomconfig');

			store.findOne({"applianceType": applianceType, "applianceCollection.homename": ownerhomeid}, {"applianceCollection.homedata": 1})
				.then(function(docs){

					if(docs != null){
							// reference to client sent payload data which will be inserted
							var roomdata = applianceData['homedata'][0]['roomdata'];
							var roomdata2 = applianceData['homedata'][0];

							// reference to Database
							var homedata = docs.applianceCollection[0].homedata;
							var roomExist = false;

							for(var h of homedata){
								if(h.roomname == roomname){
									roomExist = true;
									break;
								}
							}

							if(roomExist && roomdata.length > 0){
								// if room exist and there is some selection
								store.updateOne({"applianceType": applianceType, "applianceCollection.homename": ownerhomeid, "applianceCollection.homedata.roomname": roomname}, {$set: {"applianceCollection.0.homedata.0.roomdata": roomdata}})
									.then(function(r){
										res.json(r);
									})
									.catch(function(err){
										res.json(err);
									});
							}
							else if(roomExist && roomdata.length == 0){
								// if room exist but there is no more selection
								store.updateOne({"applianceType": applianceType, "applianceCollection.homename": ownerhomeid, "applianceCollection.homedata.roomname": roomname}, {$pop: {"applianceCollection.0.homedata": 1}})
									.then(function(r){
										res.json(r);
									})
									.catch(function(err){
										res.json(err);
									});
							}
							else if(roomExist == false && roomdata.length > 0){
								// if room does not exist (i.e. different room exist) but there is some selection
								store.updateOne({"applianceType": applianceType, "applianceCollection.homename": ownerhomeid}, {$push: {"applianceCollection.0.homedata": roomdata2}})
									.then(function(r){
										res.json(r);
									})
									.catch(function(err){
										res.json(err);
									});
							}
					}
					else{
						// neither home nor room exists. so, insert afresh
						store.updateOne({"applianceType": applianceType}, {$push: {"applianceCollection": applianceData}})
							.then(function(r){
								res.json(r);
							})
							.catch(function(err){
								res.json(err);
							});
					}
				})
				.catch(function(err){
					res.json(err);
				});
		});
	}
});


// appliance config final update
app.post("/api/v1/applconfigdone", function(req, res){
	var cases = req.body.case;
	var room = req.body.roomName;
	var owner = req.body.ownerId;
	var home = req.body.ownerHomeId;
	var rootCatg = req.body.rootCatg;

	switch(cases){
		case 'first':
			// code for first
			MongoClient.connect(url, {uri_decode_auth: true}, function(err, db){
				assert.equal(null, err);

				// set the collection
				var doq = db.collection('roomconfig');
				doq.updateOne({applianceType: rootCatg}, {$push: {owners: owner, homes: home, rooms: room}})
					.then(function(r){
						res.json(r);
					})
					.catch(function(err){
						res.json(err);
					});
			});
			break;
		case 'second':
			// code for last
			MongoClient.connect(url, {uri_decode_auth: true}, function(err, db){
				assert.equal(null, err);

				// set the collection
				var doq = db.collection('roomconfig');
				doq.updateOne({applianceType: rootCatg}, {$pull: {owners: owner, homes: home, rooms: room}})
					.then(function(r){
						res.json(r);
					})
					.catch(function(err){
						res.json(err);
					});
			});
			break;
		default:
			res.json({msg: "unknown case"});
	}
});

app.get("/api/v1/roomconfigdone", function(req, res){

});


// room configuration final
app.post("/api/v1/roomconfigdone", function(req, res){
	// extract params
	var oHomeId = req.body.ownerHomeId;
	var oRoomName = req.body.roomName;

	MongoClient.connect(url, {uri_decode_auth: true}, function(err, db){
		assert.equal(null, err);

		//res.json({msg: "hello world"});
		var roomData = {
			name: oRoomName,
			homeid: oHomeId,
			themeURL: ""
		};
		var doc = db.collection('room');

		doc.insertOne(roomData)
			.then(function(r){
				res.json(r);
			})
			.catch(function(err){
				res.json(err);
			});
	});
});

// get all the appliances available for the requested room per home per owner
app.get("/api/v1/appliancePerRoom", function(req, res){
	// extract the params
	var oId = req.query.owner;
	var ohomeId = req.query.home;
	var room = req.query.room;

	MongoClient.connect(url, {uri_decode_auth: true}, function(err, db){
		assert.equal(null, err);

		var doc = db.collection('roomconfig');

		doc.find({ owners: oId, homes: ohomeId, rooms: room }, { applianceType: 1, applianceTypeName: 1, applianceTypeImgURL: 1 })
			.toArray()
			.then(function(docs){
				res.json(docs);
			})
			.catch(function(err){
				res.json(err);
			});
	});
});

app.post("/api/v1/applianceDetailsPerRoom", function(req, res){
	// extract the params
	var applType = req.body.appliance_type;
	var ownerHomeId = req.body.homeid;
	var roomName = req.body.roomname;

	if(applType == 'light'){
		MongoClient.connect(url, {uri_decode_auth: true}, function(err, db){
			assert.equal(null, err);

			var doc = db.collection('roomconfig');
			// construct an object & inject the keys
			var needle = "applianceCollection.items." + ownerHomeId + "." + roomName;

			var a1 = new Object();
			a1['$exists'] = true;

			var a2 = new Object();
			a2['applianceCollection.$.items'] = 1;

			var tempObj = new Object();
			tempObj['applianceType'] = applType;
			tempObj[needle] = a1;

			//tempObj = "'applianceCollection.items.homesomnath772.Bedroom'";
			doc.find(tempObj, a2)
				.toArray()
				.then(function(docs){
					res.json(docs);
				})
				.catch(function(err){
					res.json(err);
				});
		});
	}
	else{
		MongoClient.connect(url, {uri_decode_auth: true}, function(err, db){
			assert.equal(null, err);

			var doc = db.collection('roomconfig');
			var tempObj = "";
			tempObj = "applianceCollection." + ownerHomeId + "." + roomName;
			doc.find({ applianceType: applType, tempObj: { $exists: true }}, { "applianceCollection.$.items": 1 })
				.toArray()
				.then(function(docs){
					res.json(docs);
				})
				.catch(function(err){
					res.json(err);
				});
		});
	}
});

module.exports = app;

