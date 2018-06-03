var serviceApp = angular.module('ServicesApp', ['ngRoute']);

serviceApp.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/service', {
    templateUrl: '/index.html'
  });

  // localStorageServiceProvider.setPrefix('LocalStorageApp');
  // $qProvider.errorOnUnhandledRejections(false);
}]);

serviceApp.controller('QueueServicesCtrl',['$scope', '$http', '$timeout', '$window','$filter','filterFilter',function($scope, $http, $timeout,$window,$filter,filterFilter){

	var socket = io.connect();
	var serviceID = "";	

	var services = "";
	var record = {};

	$scope.selection = [];

	$scope.counterNo = ["Counter-1","Counter-2","Counter-3","Counter-4","Counter-5","Counter-6"];
	$scope.profile = {};
	$scope.busyBT = true;

	var checkstate;
    var queueRequest;
	var currentQ;
	// var waittingList;
	$scope.waittingList;
	$scope.waittingQ = [];	
	$scope.list;

	$scope.options = [
		{ name: 'เพิ่มวิชาเรียน,เปลี่ยนตอนเรียน ', option: 1, selected: true },
		{ name: 'ทุนการศึกษา', option: 2, selected: false },
		{ name: 'จองห้องเรียน', option: 3, selected: false },
		{ name: 'คำร้องทั่วไป', option: 4, selected: false },
		{ name: 'งานสอบ', option: 5, selected: false },
		{ name: 'ถอนวิชาเรียน', option: 6, selected: false },
		{ name: 'อื่นๆ', option: 7, selected: false },
	];

	var refresh = function(){
		    

		$http.get('/service/refresh').then(successCallback,errorCallback);
	  	function successCallback(response){	
	  		var queueBuff = [];
	  		var i = 0;
	  		state = response.data[0];
	  		checkstate = state;

	  		queueRequest = response.data[3];
	  		pendingQ = response.data[4];	  		

	  		arrayTask = $scope.selection;
			task = arrayTask.toString();

			getQ = response.data[1];
	  		currentQ = getQ[0]
	  		user = response.data[2]
	  		$scope.name = user.name;
	  		$scope.waittingList = response.data[5]

	  		serviceDesciption($scope.waittingList)

	  		console.log(response.data)    

		 if (pendingQ == "" || pendingQ == null){  
            	console.log("pendingQ is null or empty")
		  		if (state == "standby"){
		  			$scope.nextBT = true;
		  			$scope.current = "";
		  		}else{
		  			console.log($scope.selection.toString())
		  			queueRequest.forEach(function(queue){            // check task availiable
		  				i++;
		  				if($scope.selection.toString().includes(queue.task)){
		  					queueBuff.push(queue)
		  				}
	                    
	                    if(i == queueRequest.length){
	                    	console.log(queueBuff)
	                    	if(queueBuff != ""){
			  					$scope.nextBT = false;
			  					isNext = "yes";
			  				}else{
			  					console.log("noQ & pendingQ")
			  					$scope.current = "";
			  					$scope.nextBT = true;
			  				}
	                    }
		  				
	 
		  			});
		  			
		  		}
		  	}else{		  		
                $scope.profile = pendingQ;	
                console.log("pendingQ:",$scope.profile);			
				$scope.current = pendingQ.queue;
				// $scope.nextBT = false;
				if ($scope.selection.toString().includes(pendingQ.task)){
					$scope.nextBT = false;
					isNext = "no";
				}else{
					$scope.nextBT = true;
					isNext = "yes";
				}
		  	}

	  		   			  		
	  	};
	  	function errorCallback(error){
	  		console.log("error");
	  	};

	  	
	};

	refresh();

	var serviceDesciption = function(waitQ){
		waittingQ = [];
	    waitQ.forEach(function(queueList){
			if(queueList.task == "1"){
				queueList.task_serv = "เพิ่มวิชาเรียน";
			}else if(queueList.task == "2"){
				queueList.task_serv = "ทุนการศึกษา";
			}else if(queueList.task == "3"){
				queueList.task_serv = "จองห้องเรียน";
			}else if(queueList.task == "4"){
				queueList.task_serv = "คำร้องทั่วไป";
			}else if(queueList.task == "5"){
				queueList.task_serv = "งานสอบ";
			}else if(queueList.task == "6"){
				queueList.task_serv = "ถอนวิชาเรียน";
			}else if(queueList.task == "7"){
				queueList.task_serv = "อื่นๆ";
			}else{
				queueList.task_serv = "อื่นๆ";
			}

			waittingQ.push(queueList)
		});
		$scope.waittingQ.splice(0,$scope.waittingList.length);
		$scope.waittingQ = waittingQ;
		console.log("waittingQ:",$scope.waittingQ);	    
	}

	var isNext = 'yes';
	$scope.checkNext = function(){
		if (isNext == 'yes'){
			$scope.callNext();
		}else if(isNext == 'no'){
			console.log("don't get new Q!!!")
			if ($scope.profile != ""){
				$scope.cancleBTState = true;	
				$scope.busyBTState = false;
				$scope.skipBTState = false;
				$scope.showBusyBT = true;
				$scope.showSkipBT = true;
				$scope.showFinishBT = false;
				$scope.nextBT = true;
			}else{
				$scope.current = "";
				$scope.busyBTState = true;
				$scope.skipBTState = true;
				$scope.cancleBTState = false;
			}
		}else{
			console.log("anothet case!!!")
		}
	}

	$scope.showBusyBT;
	$scope.showSkipBT;
	$scope.showFinishBT;
	
	$scope.callNext = function(){
		$scope.nextBT = true;
		now = new Date();
		now.setHours(0);
		now.setMinutes(0);
		now.setSeconds(0);
		dateNow = $filter('date')(now, "yyyy-MM-dd");
		timeNow = $filter('date')(now, "HH:mm:ss");
		dtNow = dateNow + 'T' + timeNow;
		arrayTask = $scope.selection;
		task = "task" + arrayTask.toString();
		callRequest = [dtNow,$scope.selectedCounter,$scope.name,task];		
		$http.get('/service/callnext/' + callRequest).then(successCallback,errorCallback);

		function successCallback(response){

			console.log("queue:",response.data.queue);
			if (response.data.queue != null){	// edit from --> response.data.queue != ""
			    console.log(response.data)			
				$scope.profile = response.data;				
				$scope.current = response.data.queue;
				$scope.cancleBTState = true;	
				$scope.busyBTState = false;
				$scope.skipBTState = false;
				$scope.showBusyBT = true;
				$scope.showSkipBT = true;
				$scope.showFinishBT = false;
				isNext = 'no';
				// $scope.nextBT = true;
			}else{
				$scope.current = "";
				$scope.profile = response.data;
				$scope.busyBTState = true;
				$scope.skipBTState = true;
				$scope.cancleBTState = false;
				$scope.showBusyBT = false;
				$scope.showSkipBT = false;
				$scope.showFinishBT = false;
				// $scope.nextBT = true;
				$scope.nextBT = true;
				isNext = "yes";
			}

			// refresh();
		}

		function errorCallback(error){
			console.log(error);
		}
		$scope.busyBT = true;
		socket.emit('callnext', $scope.selectedCounter);

	}

	socket.on('oncallnext', function(data){ 
		
        var queueBuff = [];
        waittingQStatus = data[0];
        processState = data[1];
        $scope.waittingList = data[2];

        serviceDesciption($scope.waittingList);

        isNext = 'no';
        console.log(data);
        $timeout(function(){
        	if (waittingQStatus != "" && processState != "standby" && $scope.selection.toString() != ""){
				queueRequest.forEach(function(queue){
					// console.log($scope.selection.toString(),console.log(currentQ));
					if ($scope.selection.toString().includes(queue.task)){

						queueBuff.push(queue)
	  				}
	  				console.log("queueBuff:",queueBuff);

	  				if(queueBuff != ""){
	  					$scope.nextBT = false;
	  				}else{
	  					$scope.nextBT = true;
	  					isNext = "yes";
	  				}
				});
				
				
			}

        },10)

	});

	socket.on('updatewaittable',function(data){
		$timeout(function(){
			$scope.waittingList = data;
	        serviceDesciption($scope.waittingList);
		},15)
		
	});
	
	socket.on('clickService', function(data){
		console.log(data);			
	});

	$scope.recordProfile = function(){
		$scope.profile.status = "finished";
		now = new Date();
		dateNow = $filter('date')(now, "yyyy-MM-dd");
		timeNow = $filter('date')(now, "HH:mm:ss");

		$http.put('/service/record/' + $scope.profile._id,$scope.profile).then(successCallback,errorCallback);

	  	function successCallback(response){	
	  		
	  		console.log(response.data);
	  		isNext = 'yes';
	  		$scope.nextBT = false;
	  		$scope.showFinishBT = false;
            $scope.showSkipBT = false;
            $scope.showBusyBT = false;
	  		// finishedUpdate = "yes";
	  		refresh();
	  	};
	  	function errorCallback(error){
	  		console.log("error");
	  		   
	  	};

	  	socket.emit('record', $scope.profile); 
	  	$scope.profile = ""; 	

	};

	$scope.selectedServices = function selectedServices() {
	    return filterFilter($scope.services, { selected: true });	    
	};

	

	$scope.resetQ = function(){
		$http.get('/service/clear').then(successCallback,errorCallback);

	  	function successCallback(response){	
	  		$scope.current = "";

	  	};
	  	function errorCallback(error){
	  		console.log("error");
	  		   
	  	};

	  	socket.emit('resetServiceQ', 'reset');
	  	$scope.profile = ""; 
	};
	

	// Selected fruits
	$scope.selection = [];

	// Helper method to get selected fruits
	$scope.selectedOptions = function selectedOptions() {
	return filterFilter($scope.options, { selected: true });
	};

	// Watch option for changes
	$scope.$watch('options|filter:{selected:true}', function (nv) {		
		$scope.selection = nv.map(function (option) {			
			return option.option;
		});
	}, true);

	$scope.checkTask = function(){
		refresh();
		var queueBuff = [];
		$timeout(function() {
			// console.log("task")
			socket.emit('checkTask', $scope.name);
			socket.on('backtoCheckTask',function(data){
                // console.log(queueRequest) // get queueRequest from refresh     
                        
                waittingQStatus = data[0];
                processState = data[1];
                pendingQ = data[2]
                
                $timeout(function(){
                	if (pendingQ != ""){
						if(state = "ready" && task.includes(pendingQ.task) ){
							$scope.nextBT = false;
						}else{
							$scope.nextBT = false; 
						}

					}else{
	                	if (waittingQStatus != "" && processState != "standby" && $scope.selection.toString() != ""){
							queueRequest.forEach(function(queue){
								// console.log($scope.selection.toString(),console.log(currentQ));
								if ($scope.selection.toString().includes(queue.task)){

									queueBuff.push(queue)
				  				}

				  				if(queueBuff != ""){
				  					$scope.nextBT = false;
				  				}else{
				  					$scope.nextBT = true;
				  				}
							});
							
							
						}else{
							console.log("yes")
							$scope.nextBT = true;
						}
					}

                },15)
				
			});			

		},10)
	}

	$scope.busyStatus = function(){
		$scope.profile.status = "busy";
		console.log($scope.profile._id);
		$scope.busyBT = false;
		$scope.busyBTState = true;
		$scope.skipBTState = true;
		$http.put('/service/busyupdate/' + $scope.profile._id, $scope.profile).then(successCallback,errorCallback);
		function successCallback(response){	
	  		console.log(response.data);
            isNext = 'no'
            $scope.showFinishBT = true;
	  	};
	  	function errorCallback(error){
	  		console.log("error");
	  		   
	  	};

	  	socket.emit('busyStatus', $scope.profile);


	};
	var finishedUpdate = "no";

	$scope.skipStatus = function(){
		now = new Date();
		dateNow = $filter('date')(now, "yyyy-MM-dd");
		timeNow = $filter('date')(now, "HH:mm:ss");
		dtNow = dateNow + 'T' + timeNow;
		$scope.profile.status = "skip";
		$scope.profile.finishTime = dtNow;
		$http.put('/service/skipupdate/' + $scope.profile._id,$scope.profile).then(successCallback,errorCallback);
		function successCallback(response){	
	  		console.log(response.data);
            isNext = 'yes'
            $scope.nextBT = true;
            $scope.showFinishBT = false;
            $scope.showSkipBT = false;
            $scope.showBusyBT = false;
            refresh();
            // $scope.profile = "";
            // finishedUpdate = "yes";


	  	};
	  	function errorCallback(error){
	  		console.log("error");
	  		   
	  	};

	  	socket.emit('skipStatus', $scope.profile);
	  	$scope.profile = ""; 
	};

	socket.on('serviceStatus', function(data){
		
		$timeout(function() {
			state = data[0];
			checkstate = state;
			currentQ = data[1];
			// pendingQ = data[2];
			arrayTask = $scope.selection;
			task = arrayTask.toString();
			$scope.waittingList = data[2];

			serviceDesciption($scope.waittingList);
			
			if (state = "ready" && task.includes(currentQ.task) ) {
				$scope.nextBT = false;
	  		}else if (state = "continue" && task.includes(currentQ.task) ){
	  			$scope.nextBT = false; 
	  		}else{
	  			if ($scope.profile != ""){
	  				$scope.nextBT = false;
	  			}else{
	  				$scope.nextBT = true;
	  			}
	  			// $scope.nextBT = true;
	  			//refresh();
	  		}
			
			

		},15);
	});

	socket.on('NoQ',function(data){
		$timeout(function() {
			state = data;
			// checkstate = state;
			// currentQ = data[1];
			// // pendingQ = data[2];
			// arrayTask = $scope.selection;
			// task = arrayTask.toString();

			console.log(data);
			if (state = "NoQ" ) {
				// $scope.nextBT = true;
				// refresh();
				console.log(isEmpty($scope.profile));
				// if ($scope.profile == null || $scope.profile == ""){
				// 	console.log($scope.profile);
				// 	$scope.nextBT = true;
				// 	console.log("isNoQ")
				// }else{
				// 	console.log($scope.profile)
				// 	console.log("profile")
				// 	$scope.nextBT = false;
				// }
				if (isEmpty($scope.profile)){
					console.log($scope.profile);
					$scope.nextBT = true;
					console.log("isNoQ")
					$scope.waittingList = "";
				}else if ($scope.profile == "" || $scope.profile == null){
					$scope.nextBT = true;
					console.log("isNoQ")
					$scope.waittingList = "";
				}else{
					console.log($scope.profile)
					console.log("profile")
					$scope.nextBT = false;
				}
	  		}else {
	  			console.log("falseNoQ")
	  			$scope.nextBT = false; 
	  		}
			
			

		},25);
	});

	function isEmpty(obj) {
		for (var prop in obj) {
			if (obj.hasOwnProperty(prop)){
				return false;
			}
		}
		return JSON.stringify(obj) === JSON.stringify({});
	}

	socket.on('isEndQ',function(data){
		var queueBuff = [];
        waittingQStatus = data[0];
        processState = data[1];
        //isNext = 'no';
        console.log(data);
        $timeout(function(){
        	if (waittingQStatus != "" && processState != "standby" && $scope.selection.toString() != ""){
				queueRequest.forEach(function(queue){
					// console.log($scope.selection.toString(),console.log(currentQ));
					if ($scope.selection.toString().includes(queue.task)){

						queueBuff.push(queue)
	  				}

	  				if(queueBuff != ""){
	  					$scope.nextBT = false;
	  				}else{
	  					if ($scope.profile != ""){
	  						$scope.nextBT = false;
	  					}else{
	  						$scope.nextBT = true;
	  					}
	  					
	  					// refresh();
	  				}
				});
				
				
			}

        },15)        
	})

}]);