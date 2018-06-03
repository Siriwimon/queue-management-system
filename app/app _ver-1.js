#!/usr/bin/env nodejs

// set up mongodb =========================================================================
var mongojs = require('mongojs');
// var db = mongojs('mongodb://queue-admin:test%401234@localhost:27017/queuelog',['queuelog']);
var db = mongojs('mongodb://testQ:12345678@localhost:27017/testQLog',['testQLog']);   //for test only
var dbCollections = ["customerlog","servicelog"];
var bodyParser = require('body-parser');
var moment = require('moment-timezone');
var schedule = require('node-schedule')

// cross domain ===========================================================================
var querystring = require('querystring');
var http = require('http');
 
// declaire variable
var lastQueue,lastIncrement,queueNumber,incrementNumber,taskRequire,queueStore;
var serviceIncrement,lastServiceInc;
var queueRequest = [];
var serviceRecord = [];
var waittingQ = [];
var currentQ;
var queueInfo;
var state = 'standby';
var pendingList = [];
// var pendingQ;

Array.prototype.diff = function(a) {
    return this.filter(function(i) {return a.indexOf(i) < 0;});
};

// schedule every day at 1:00 am

var rule = new schedule.RecurrenceRule();
rule.hour = 1;
rule.minute = 0;

var timer = schedule.scheduleJob(rule,function(){
    initProcess(function(res){
		// console.log(res);
		queueRequest = res.queueRequest;
		serviceRecord = res.serviceRecord;
		waittingQ = res.waitingQ;
		state = res.state;
		console.log("queueRequest: ",queueRequest);
		console.log("serviceRecord: ",serviceRecord);
		console.log("waittingQ: ",waittingQ);
		console.log("state: ",state);
		
		// lastServiceInc = res.lastServiceInc;
		getLastQueue(function(response){
			lastServiceInc = response.lastServiceInc;
			lastQueue = response.lastStrQ;
			lastIncrement = response.lastIncrement;
			console.log("lastServiceInc: ",lastServiceInc);	
			console.log("lastQueue: ",lastQueue);
			console.log("lastIncrement: ",lastIncrement);	
		});
		
	});

});

var newFormatDate = function(){
	var startDate = new Date();
		// startDate.setDate(startDate.getDate() - 1) ;
		startDate.setHours(0);
		
		var parseST = moment.tz(startDate,"Asia/Bangkok")
		var intervalStart = parseST.format();
	
	var endDate = new Date();
		endDate.setDate(endDate.getDate() + 1);
		endDate.setHours(0);
		var parseED = moment.tz(endDate,"Asia/Bangkok")
		var intervalEnd = parseED.format();	

	return {
		intervalStart: intervalStart,
		intervalEnd: intervalEnd
	};
};

function initProcess(callback){

	var date = newFormatDate();
	var intervalStart = date.intervalStart;
	var intervalEnd = date.intervalEnd;

	var iter = 0;
	var waitBuffer = [];
	var stateBuffer = "standby";
	var db1,db2;
	console.log(intervalStart,intervalEnd);
	var q1 = [];
	var q2 = [];

	dbCollections.forEach(function(collection){
		db[collection].find(
			{timestamp : {$gte: intervalStart,$lte: intervalEnd}}
		).toArray(function(err,docs){
			iter++;
			// console.log(docs);
			if (collection == "customerlog"){
				db1 = docs;
				db1.forEach(function(doc){
					q1.push(doc.queue);
				});
			}else if (collection == "servicelog"){
				db2 = docs;
				db2.forEach(function(doc){
					q2.push(doc.queue);
				});				
			}
			
			if (iter == dbCollections.length){
				// console.log(db);
				
				if (db1 != "" && db2 != ""){
					console.log("continous");					
					
					// var i = 0;
					// jQuery.grep(q1, function(doc1) {
					//     if (jQuery.inArray(doc1, q2) == -1) waitBuffer.push(doc1);
					//     i++;
					// });
					waitBuffer = q1.diff(q2);

					
					// StrQ = db1[db1.length - 1].queue;
					// IntQ = Number(StrQ);
					// IncQ = db1[db1.length - 1].number;
					if (waitBuffer != ""){
						stateBuffer = "continue";
					}else{
						stateBuffer = "standby";
					}

				}else if ( db1 != "" && db2 == ""){
					// console.log("ready");
					db1.forEach(function(doc){
						waitBuffer.push(doc.queue);
					})
					stateBuffer = "ready"
					// StrQ = db1[db1.length - 1].queue;
					// IntQ = Number(StrQ);
					// IncQ = db1[db1.length - 1].number;
				}else{
					// console.log("standby");
					stateBuffer = "standby"
					// IntQ = 0;
					// IncQ = 0;
					waitBuffer.splice(0,waitBuffer.length);  //clear waitBuffer
				}
				
				allDocs = {
					queueRequest: db1,
					serviceRecord: db2,
					waitingQ: waitBuffer,
					state: stateBuffer,
					// lastStrQ: IntQ,
					// lastIncrement: IncQ
				}

				callback(allDocs);
				// db.close();
			}
		});
	});
};

initProcess(function(res){
	// console.log(res);
	queueRequest = res.queueRequest;
	serviceRecord = res.serviceRecord;
	waittingQ = res.waitingQ;
	state = res.state;
	console.log("queueRequest: ",queueRequest);
	console.log("serviceRecord: ",serviceRecord);
	console.log("waittingQ: ",waittingQ);
	console.log("state: ",state);
	
	// lastServiceInc = res.lastServiceInc;
	getLastQueue(function(response){
		lastServiceInc = response.lastServiceInc;
		lastQueue = response.lastStrQ;
		lastIncrement = response.lastIncrement;
		console.log("lastServiceInc: ",lastServiceInc);	
		console.log("lastQueue: ",lastQueue);
		console.log("lastIncrement: ",lastIncrement);	
	});
	
});

function getLastQueue(callback){
	i = 0;
	dbCollections.forEach(function(collection){

		db[collection].find({}).sort({_id:-1}).limit(1).toArray(function(err,docs){

			i++;
			// console.log(docs);
			if (collection == "customerlog"){
				item1 = docs;
			}else if (collection == "servicelog"){
				item2 = docs;
								
			}
			
			if (i == dbCollections.length){

				
				// console.log(year,month,day);

				var current = new Date();
					parseToday = moment.tz(current,"Asia/Bangkok").format();
				// console.log(parseToday);
				var today = new Date(parseToday);
					currentYear = today.getFullYear();
					currentMonth = today.getMonth() + 1;
					currentDay = today.getDate();
				// console.log(currentYear,currentMonth,currentDay);
				// getIncrement = item1[0].number;
				// getServiceInc = item2[0].number;

				if (item1 == ""){
					getIncrement = 0;
					IntQ = 000;
				}else if (item1 != ""){
					getIncrement = item1[0].number;
					if (item1[0].timestamp != null){

						timestamp = item1[0].timestamp;
						console.log(timestamp);
						var dt = new Date(timestamp);
							parseDT = moment.tz(dt,"Asia/Bangkok").format();
						var date = new Date(parseDT);
							year = date.getFullYear();
							month = date.getMonth() + 1;
							day = date.getDate();

						if ((year == currentYear) && (month == currentMonth) && (day == currentDay)) {
							// console.log(queue);
							StrQ = item1[0].queue;					
							IntQ = Number(StrQ);									
						}else{
							StrQ = '000';
							IntQ = Number(StrQ);				
						}					
					}else if (item1[0].timestamp == null){
						StrQ = '000';
						IntQ = Number(StrQ);				
					}
				}

				if (item2 == ""){
					getServiceInc = 0;
					console.log(getServiceInc);
				} else if (item2 != ""){
					getServiceInc = item2[0].number;
				} 


				// if (item1[0].timestamp != null){

				// 	timestamp = item1[0].timestamp;
				// 	console.log(timestamp);
				// 	var dt = new Date(timestamp);
				// 		parseDT = moment.tz(dt,"Asia/Bangkok").format();
				// 	var date = new Date(parseDT);
				// 		year = date.getFullYear();
				// 		month = date.getMonth() + 1;
				// 		day = date.getDate();

				// 	if ((year == currentYear) && (month == currentMonth) && (day == currentDay)) {
				// 		// console.log(queue);
				// 		StrQ = item1[0].queue;					
				// 		IntQ = Number(StrQ);									
				// 	}else{
				// 		StrQ = '000';
				// 		IntQ = Number(StrQ);				
				// 	}					
				// }else if (item1[0].timestamp == null){
				// 	StrQ = '000';
				// 	IntQ = Number(StrQ);				
				// }

				// db.serviceRecord.find({}).sort({_id:-1}).limit(1).toArray(function(err,doc){
				// 	serviceIncrement = doc[0].number;
				// 	if (serviceIncrement == null){
				// 		serviceIncrement = 1;					
				// 	}
				// });

				var lastRefQ = {
					lastStrQ: IntQ,
					lastIncrement: getIncrement,
					lastServiceInc: getServiceInc
				}
				callback(lastRefQ);
			}
			// db.close();
		});
	});
	
};

// route middleware to make sure
function isLoggedIn(req, res, next) {

	// if user is authenticated in the session, carry on
	if (req.isAuthenticated())
		return next();

	// if they aren't redirect them to the home page
	res.redirect('/service');
}


module.exports = function(app,passport,io) {

// ======================== CUSTOMER =========================

// app.get('/customer/blankpage', function (req,res){
//     res.render('blankpage.html')
// });

app.get('/customer/refresh', function (req,res){
	var reqIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress;	
	var arrReqIP = reqIP.split(":");
	var ip = arrReqIP[3];
	console.log("ip:",ip);
	if (ip == "172.19.43.201"){
		console.log("ip:",req.connection);
		console.log("load page")
		res.json("noredirect")
		// getLastQueue(function(response){
		// 	console.log("getLastQueue")		
		// 	lastQueue = response.lastStrQ;
		// 	lastIncrement = response.lastIncrement;	
		// 	lastServiceInc = response.lastServiceInc;
		// 	queueStr = lastQueue.toString();
		// 	if (queueStr.length == 1){
		// 		queueNumber = '00' + queueStr;
		// 	} else if (queueStr.length == 2){
		// 		queueNumber = '0' + queueStr;		
		// 	}else {
		// 		queueNumber = queueStr;
		// 	}	
		// 	lastQInfo = [queueNumber,lastIncrement,lastServiceInc];	
		// 	res.json(lastQInfo);		
		// });
	}else{
		console.log('redirect')
		// res.json("redirect")
		// res.redirect('/customer/blankpage');

		// res.writeHead('301',
		// 	{location: 'www.ecc.eng.kmutnb.ac.th'}
		// );
		// res.redirect('192.168.10.164:3000')
		// res.end();
		// res.setHeader('Access-Control-Allow-Origin','http://192.168.10.168:3000')
		// res.redirect('www.ecc.eng.kmutnb.ac.th')
		// next();
		res.clearCookie();
		// res.redirect('/service');
		req.session.destroy(function(err){
	       res.end();      
		});
		var options = {
			
			host: 'www.eng.kmutnb.ac.th',			
			port: 80,			
			method: 'POST',	
			// path: '/blankpage'		
		};

		var urlreq = http.request(options, function (response) {
			response.setEncoding('utf8');
			// console.log(response);
			// res.redirect('www.eng.kmutnb.ac.th')
			res.end();
			response.on('data', function (chunk) {
			  console.log("body: " + chunk);
			  // res.send(chunk);

			});			
		});	

		urlreq.on('error',function(e){
            console.log('error'); 
            // resData = [queueInfo,"error"]
            // res.send(resData);   
            res.end();             
            
		});	


		// urlreq.write();
		urlreq.end();


	}

});

app.get('/customer/selectedOption/:text', function (req,res){
	taskRequire = req.params.text;
    ip = req.connection.remoteAddress;
    console.log("ip:",ip);
	var checkLast = lastQueue + 1;
	var lastQueueStr = checkLast.toString();
	if (lastQueueStr.length == 1){
		lastQueueNumber = '00' + lastQueueStr;
	} else if (lastQueueStr.length == 2){
		lastQueueNumber = '0' + lastQueueStr;		
	}else {
		lastQueueNumber = lastQueueStr;
	}
 	
 	db.servicesubject.createIndex({ "$**": "text" },{ name: "TextIndex" });
 	db.servicesubject.find({"$text": {"$search": taskRequire}}, function(err, doc) {
 		console.log(doc); 
 		subjectInfo = [lastQueueNumber,doc];
 		res.json(subjectInfo);
 	});
});


app.get('/customer/getqueue/:text', function (req,res){
    var reqIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress;	
	var arrReqIP = reqIP.split(":");
	var ip = arrReqIP[3];
	console.log("ip:",ip);
	// if (ip == "172.19.43.201"){
	    text = req.params.text;
	    arr = text.split(",");
	    taskRequire = arr[0];
	    studentid = arr[1];
		lastQueue = lastQueue + 1;
		queueStr = lastQueue.toString();
		if (queueStr.length == 1){
			queueNumber = '00' + queueStr;
		} else if (queueStr.length == 2){
			queueNumber = '0' + queueStr;		
		}else {
	        queueNumber = queueStr;
	    }  

		lastIncrement = lastIncrement + 1;
		incrementNumber = lastIncrement;

		waittingQ.push(queueNumber);

		now = new Date()
		parseDate = moment.tz(now,"Asia/Bangkok")
		timestamp = parseDate.format();	

		queueInfo = {
			number: incrementNumber,
			queue: queueNumber,
			task: taskRequire,
			studentid: studentid,
			rfid: "",
			timestamp: timestamp
		}
	    
	    state = "ready";
		console.log(queueInfo);

		queueRequest.push(queueInfo);
		db.customerlog.insert(queueInfo,
			function (err,doc){			
				// res.json(queueInfo);

				// == cross domain to rpi for printting Q ==
	            
				var data = querystring.stringify(queueInfo);

				var options = {
					host: ip, //rpi 3
					// host: '172.19.43.201',
					// host: '172.19.202.155', //ubuntu 16.04
					// host: '172.19.42.237',
					// port: 5000,
					port: 5050,
					path: '/printQ',
					data: data,
					method: 'POST',
					headers: {
					  'Content-Type': 'application/json',
					  'Content-Length': Buffer.byteLength(data)
					}
				};

				var isSuccess = "";
				var jsonRes;
				var httpreq = http.request(options, function (response) {
					response.setEncoding('utf8');
					// console.log(response);
					response.on('data', function (chunk) {
					  console.log("body: " + chunk);
					  jsonRes = JSON.parse(chunk);
					  resChunk = jsonRes.success;
					  if(resChunk == 'noprinter'){
					  	isSuccess = "error";
					  }else{
					  	isSuccess = "Success"
					  }
					});

					response.on('end', function() {
						console.log(isSuccess);
						resData = [queueInfo,isSuccess]
	                    res.send(resData);
					    // res.send(queueInfo);
					});
					response.on('response', function(resp) {

						console.log("response");
					    // res.send(queueInfo);
					});
					
				});	

				httpreq.on('error',function(e){
	                console.log('error'); 
	                resData = [queueInfo,"error"];
	                res.send(resData); 
	                httpreq.abort();
	                               
	                
				});	

				httpreq.on('timeout',function(){
					console.log('timeout');
					resData = [queueInfo,"error"]
					res.send(resData);
					httpreq.abort();
				});


				httpreq.write(data);
				httpreq.end();	
				httpreq.setTimeout(1000);
				

			}
		);
	// }else{
	// 	console.log("test")
	// 	// resData = [queueInfo,"error"]
	// 	// res.send(resData);
	// 	// res.redirect('www.eng.kmutnb.ac.th');
	// }

	
});

// ========================= SERVICE ==============================

app.get('/service', function(req, res) {
		res.render('index.ejs', { message: req.flash('loginMessage') }); // load the index.ejs file
	});

app.get('/service/callback', isLoggedIn, function(req, res) {		
        res.render('service.html', {
            user : req.user // get the user out of session and pass to template
        });
		
	});

// process the login form
app.post('/service/login', passport.authenticate('local-login', {
	successRedirect : '/service/callback', // redirect to the secure profile section
	failureRedirect : '/service', // redirect back to the signup page if there is an error
	failureFlash : true // allow flash messages
}));

app.get('/service/logout', function(req, res) {
	console.log('logout')
	req.logout();	
	res.clearCookie('sid', {path: '/service'});
	// res.redirect('/service');
	req.session.destroy(function(err){
       res.redirect('/service');       
	});
	// 
	// return next();
});

app.get('/service/refresh', function(req,res){
	// lastRequest = [state,queueInfo]
	// res.json(lastRequest);
	var pendingQ;
	queueBuffer.splice(0,queueBuffer.length);
	queueRequest.forEach(function(Q){
		waittingQ.forEach(function(wait){
			if ((wait == Q.queue)){  // if service_task include task require
				console.log(Q.queue);
				queueBuffer.push(Q);

			}
		});
	});
	user = req.user.local;
	 
	
	if (pendingList == ""){
		pendingQ = "";
	}else{
		pendingList.forEach(function(Q){
            if(Q.serviceby.includes(user.name)){
            	pendingQ = Q;            	
			}
            
		});
	}
	db.customerlog.find({}).sort({_id:-1}).limit(1).toArray(function(err,docs){
		lastRequest = [state,docs,user,queueBuffer,pendingQ];
		res.json(lastRequest);
	});
});

var queueBuffer = [];
app.get('/service/callnext/:text', function(req,res){
	var text = req.params.text;	
	var splitInfo = text.split("task");
	var arrInfo = splitInfo[0].split(",");
	var task = splitInfo[1].toString();
	var status = "calling"
	var serviceInfo = {
		datetime: arrInfo[0],
		counter: arrInfo[1],
		name: arrInfo[2],
		task: task
	}

	if (state == "standby"){
		res.json(state);
	}else if( state == "ready" || state == "continue"){
		queueBuffer.splice(0,queueBuffer.length);
		queueRequest.forEach(function(Q){
			waittingQ.forEach(function(wait){
				if ((serviceInfo.task.includes(Q.task)) && (wait == Q.queue)){  // if service_task include task require
					console.log(Q.queue);
					queueBuffer.push(Q);

				}
			});
		});
		console.log(queueBuffer)
		if (queueBuffer == ""){
				QNumber = "";
				Qtask = "";
				Qid = "";	
				currentQ = {
					number: serviceIncrement,
					queue: QNumber,
					task: Qtask,
					status: status,
					counter: serviceInfo.counter,
					serviceby: serviceInfo.name,
					timestamp: timestamp,
					studentid: Qid,
					// rfid: Qrfid
			}
			res.json(currentQ);		
		}else{
			QNumber = queueBuffer[0].queue;
			Qtask = queueBuffer[0].task;
			Qid = queueBuffer[0].studentid;
			// Qrfid = queueBuffer[0].rfid;
			if(queueBuffer[0].rfid != ''){
               Qrfid = queueBuffer[0].rfid;
			}else{
               Qrfid = '';
			}
			var index = waittingQ.indexOf(QNumber)  // 
			if (index !== -1){
				waittingQ.splice(index, 1 );
				if (waittingQ.length == 0){
					state = "standby";
				}else{
                    state = "continue";
				}
			}

			if(lastServiceInc == ""){
				serviceIncrement = 1;
			}else{
				lastServiceInc = lastServiceInc + 1;
				serviceIncrement = lastServiceInc;
				console.log(serviceIncrement); 
			}
			console.log(waittingQ);
			// console.log(queueBuffer[0]);
			now = new Date()
			parseDate = moment.tz(now,"Asia/Bangkok")
			timestamp = parseDate.format();	
			currentQ = {
				number: serviceIncrement,
				queue: QNumber,
				task: Qtask,
				status: status,
				counter: serviceInfo.counter,
				serviceby: serviceInfo.name,
				timestamp: timestamp,
				studentid: Qid,
				rfid: Qrfid
			}
		    serviceRecord.push(currentQ);
		    pendingList.push(currentQ);
		    console.log("pendingList:",pendingList);
		    console.log("currentQ:",currentQ);
		    // res.json(currentQ);
		    db.servicelog.insert(currentQ,
				function (err,doc){			
					res.json(doc);			
				}
			);
		}
		
	}
	// res.json(serviceInfo);
	
});

app.put('/service/busyupdate/:id', function (req, res) {
	var id = req.params.id;
	console.log(req.body.status);
	currentQ = req.body;
	db.servicelog.findAndModify({query: {_id: mongojs.ObjectId(id)}, 
		update: {$set: {status: req.body.status}},
		new: true}, function (err, doc) {
			res.json(doc);		
	});
});

app.put('/service/skipupdate/:id', function (req, res) {
	var id = req.params.id;
	console.log(req.body.status);
	currentQ = req.body;
	// newFinish = new Date(req.body.finishTime);
	newFinish = new Date();
	parseFinish = moment.tz(newFinish,"Asia/Bangkok")
	finishTime = parseFinish.format();
	if(req.body.rfid != ''){
       rfid = req.body.rfid;
	}else{
		
       rfid = '';
	}
	var index = pendingList.findIndex(x => x.serviceby==req.body.serviceby);
	db.servicelog.findAndModify({query: {_id: mongojs.ObjectId(id)}, 
		update: {$set: {rfid: rfid,status: req.body.status, finishTime: finishTime}},
		new: true}, function (err, doc) {

			if (index !== -1){
			    pendingList.splice(index, 1 );
			    console.log(index);
			    console.log(pendingList);
			}
			res.json(doc);		
	});
});

app.put('/service/record/:id', function (req, res) {
	var id = req.params.id;
	console.log(req.body.status);
	currentQ = req.body;
	// newFinish = new Date(req.body.finishTime);
	newFinish = new Date();
	parseFinish = moment.tz(newFinish,"Asia/Bangkok")
	finishTime = parseFinish.format();
	if(req.body.rfid != ''){
       rfid = req.body.rfid;
	}else{
		
       rfid = '';
	}
	var index = pendingList.findIndex(x => x.serviceby==req.body.serviceby);
	db.servicelog.findAndModify({query: {_id: mongojs.ObjectId(id)}, 
		update: {$set: {rfid: rfid, status: req.body.status, finishTime: finishTime}},
		new: true}, function (err, doc) {
			if (index !== -1){
			    pendingList.splice(index, 1 );
			    console.log(index);
			    console.log(pendingList);
			}
			res.json(doc);		
	});
});

app.get('/display/refresh', function (req, res) {
	if(queueRequest != ""){
		res.json(currentQ);
		console.log("empty")
	}else{
		noQ = "";
		res.json(noQ)
	}
});





io.sockets.on('connection', function(socket) {
	socket.on('clickService', function(message){
		setTimeout(function() {
			socket.emit('clickService', queueNumber); //send to all client
			socket.broadcast.emit('clickService', queueNumber); // send to all other clients except the newly create connection    
		}, 20); 

		setTimeout(function() {
			serviceStatus = [state,queueInfo]
			socket.emit('serviceStatus', queueInfo);
		    socket.broadcast.emit('serviceStatus', serviceStatus);
		    
		}, 25); 		
	});

	socket.on('callnext', function(message){
		queueBuffer.splice(0,queueBuffer.length);
		queueRequest.forEach(function(Q){
			waittingQ.forEach(function(wait){
				if ((wait == Q.queue)){  // if service_task include task require
					console.log(Q.queue);
					queueBuffer.push(Q);

				}
			});
		});
		setTimeout(function() {
			// if (waittingQ == ""){
			// 	serviceStatus = ['emptyQ',currentQ]
			// }else{
			// 	serviceStatus = ['waittingQ',currentQ]
			// }
			serviceStatus = [queueBuffer, state]
			// io.sockets.emit('oncallnext', serviceStatus);
			// socket.broadcast.emit('oncallnext', serviceStatus);	
			socket.emit('oncallnext', serviceStatus);	    
		}, 20); 

		setTimeout(function() {
			if (currentQ == ""){				

				newDisplay = {
					counter: "",
					queue: "",
					status: ""
				};
				
				io.sockets.emit('display', newDisplay);
		    	// io.sockets.broadcast.emit('display', newDisplay);

			}else{
				io.sockets.emit('display', currentQ);
		    	// socket.broadcast.emit('display', currentQ);
			}
			
		    
		}, 25); 

		// setTimeout(function(){
		// 	serviceStatus = [queueBuffer, state]
		// 	io.sockets.emit('isEndQ', serviceStatus);
		// 	// socket.broadcast.emit('oncallnext', serviceStatus);
		// }),28;

		setTimeout(function(){
			if (waittingQ.length == 0){
				io.sockets.emit('NoQ', 'NoQ');
			}
		},30);	

			
	});

	socket.on('busyStatus', function(message){
		newDisplay = message;	
		setTimeout(function() {			
			socket.emit('display', newDisplay);
	    	socket.broadcast.emit('display', newDisplay);		    
		}, 10); 		
	});

	socket.on('skipStatus', function(message){
		newDisplay = message;	
		setTimeout(function() {			
			socket.emit('display', newDisplay);
	    	socket.broadcast.emit('display', newDisplay);		    
		}, 10); 		
	});

	socket.on('record', function(message){
		newDisplay = message;	
		setTimeout(function() {			
			socket.emit('display', newDisplay);
	    	socket.broadcast.emit('display', newDisplay);		    
		}, 10); 		
	});

	socket.on('checkTask', function(message){
		queueBuffer.splice(0,queueBuffer.length);
		if (pendingList == ""){
			pendingQ = "";
		}else{
			pendingList.forEach(function(Q){
	            if(Q.serviceby.includes(message)){
	            	pendingQ = Q;            	
				}
	            
			});
		}
		queueRequest.forEach(function(Q){
			waittingQ.forEach(function(wait){
				if ((wait == Q.queue)){  // if service_task include task require
					console.log(Q.queue);
					queueBuffer.push(Q);

				}
			});
		});
		setTimeout(function() {	
		    serviceStatus = [queueBuffer, state, pendingQ]		
			io.sockets.emit('backtoCheckTask',serviceStatus );
	    	// socket.broadcast.emit('display', newDisplay);		    
		}, 10); 		
	});
});
// server.listen(8080);

};

// console.log("Server running on port 8081");

