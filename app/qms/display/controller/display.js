var serviceApp = angular.module('DisplayApp', ['ngRoute']);

serviceApp.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/display', {
    templateUrl: '/index.html'
  });
}]);

serviceApp.controller('DisplayCtrl',['$scope', '$http', '$timeout', '$window','filterFilter',function($scope, $http, $timeout,$window,filterFilter){

	statusText = ["calling","busy","skip","finished"];
	colors = ["#ffb74d","#EC5f67","#64b5f6","#9ccc65"];
	
	var socket = io.connect();	  	
	socket.on('display', function(data){
		console.log(data);
		displayQ = data;

		for (var i=0; i<colors.length; i++){			
			if (displayQ.status == statusText[i]){
				console.log(colors[i]);
				style = {color : colors[i]}
			}
		}
		if(displayQ.counter == "Counter-6"){
			$timeout(function(){
				$scope.currentQ6 = displayQ.queue;
				// $scope.status3 = displayQ.status;
				$scope.studentID6 = displayQ.studentid;
				$scope.color6 = style;
			}, 30);			
		}else if (displayQ.counter == "Counter-5"){
			$timeout(function(){
				$scope.currentQ5 = displayQ.queue;
				// $scope.status2 = displayQ.status;
				$scope.studentID5 = displayQ.studentid;
				$scope.color5= style;
			}, 30);
		}else if (displayQ.counter == "Counter-4"){
			$timeout(function(){
				$scope.currentQ4 = displayQ.queue;
				// $scope.status2 = displayQ.status;
				$scope.studentID4 = displayQ.studentid;
				$scope.color4= style;
			}, 30);
		}else if (displayQ.counter == "Counter-3"){
			$timeout(function(){
				$scope.currentQ3 = displayQ.queue;
				// $scope.status2 = displayQ.status;
				$scope.studentID3 = displayQ.studentid;
				$scope.color3= style;
			}, 30);
		}else if (displayQ.counter == "Counter-2"){
			$timeout(function(){
				$scope.currentQ2 = displayQ.queue;
				// $scope.status2 = displayQ.status;
				$scope.studentID2 = displayQ.studentid;
				$scope.color2= style;
			}, 30);
		}else {
			$timeout(function(){
				$scope.currentQ1 = displayQ.queue;
				// $scope.status1 = displayQ.status;
				$scope.studentID1 = displayQ.studentid;
				$scope.color1 = style;
			}, 30);
		}		
		// $timeout(function(){
		// 		$scope.standby1 = standby[0];
		// 		$scope.standby2 = standby[1];
		// 		$scope.standby3 = standby[2];
		// 	}, 30);	

	});

	

	socket.on('resetDisplayQ', function(data){
		console.log(data);
		
		$timeout(function(){
				$scope.currentQ1 = null;
				$scope.currentQ2 = null;
				$scope.currentQ3 = null;

				$scope.standby1 = null;
				$scope.standby2 = null;
				$scope.standby3 = null;
			}, 30);	

	});

	var refresh = function(){
		$http.get('/display/refresh').then(successCallback,errorCallback);
	  	function successCallback(response){	
	  		if (response.data != ""){
		  		
				displayQ = response.data;

				for (var i=0; i<colors.length; i++){			
					if (displayQ.status == statusText[i]){
						console.log(colors[i]);
						style = {"color" : colors[i]}
					}
				}
				if(displayQ.counter == "Counter-6"){
					$timeout(function(){
						$scope.currentQ6 = displayQ.queue;
						// $scope.status3 = displayQ.status;
						$scope.color6 = style;
						$scope.studentID6 = displayQ.studentid;
					}, 30);			
				}else if (displayQ.counter == "Counter-5"){
					$timeout(function(){
						$scope.currentQ5 = displayQ.queue;
						// $scope.status2 = displayQ.status;
						$scope.studentID5 = displayQ.studentid;
						$scope.color5= style;
					}, 30);
				}else if (displayQ.counter == "Counter-4"){
					$timeout(function(){
						$scope.currentQ4 = displayQ.queue;
						// $scope.status2 = displayQ.status;
						$scope.studentID4 = displayQ.studentid;
						$scope.color4= style;
					}, 30);
				}else if (displayQ.counter == "Counter-3"){
					$timeout(function(){
						$scope.currentQ3 = displayQ.queue;
						// $scope.status2 = displayQ.status;
						$scope.studentID3 = displayQ.studentid;
						$scope.color3= style;
					}, 30);
				}else if (displayQ.counter == "Counter-2"){
					$timeout(function(){
						$scope.currentQ2 = displayQ.queue;
						// $scope.status2 = displayQ.status;
						$scope.studentID2 = displayQ.studentid;
						$scope.color2= style;
					}, 30);
				}else {
					$timeout(function(){
						$scope.currentQ1 = displayQ.queue;
						// $scope.status1 = displayQ.status;
						$scope.color1 = style;
						$scope.studentID1 = displayQ.studentid;
					}, 30);
				}		
			}						
	  			  		
	  	};
	  	function errorCallback(error){
	  		console.log("error");
	  	};	  
	 		
	};

	refresh();

}]);