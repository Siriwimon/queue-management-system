
var queueApp = angular.module('QueueApp', ['ngRoute','ng-virtual-keyboard']);

// queueApp.service();

queueApp.config(['$routeProvider','VKI_CONFIG', function($routeProvider,VKI_CONFIG) {
  $routeProvider.when('/customer', {
    templateUrl: '/home/jaa/Documents/Queue-Management/Qmanange_Ver_4/customer/index.html'
  });

  VKI_CONFIG.extensions = {
		addTyping: true
  };
}]);


queueApp.controller('QueueCtrl',['$scope','ngVirtualKeyboardService', '$http', '$timeout', '$window','$location',function($scope, ngVirtualKeyboardService, $http, $timeout,$window,$location,socket){
	var socket = io.connect();
	$scope.queue = 0;
	// $scope.clickService = function(){
	// 	$scope.q++;
	// };	
	var refreshPage = function(){
		// $http.get('/customer/refresh').then(successCallback,errorCallback);
		// function successCallback(response){
		// 	// console.log(response);
		// 	$scope.queue = response.data[0];
		// };

		// function errorCallback(error){
		// 	console.log(error);
		// }

		// $.getJSON('//freegeoip.net/json/?callback=?',function(data){
		// 	console.log(data);
		// });

		// console.log($window.location)
		// $window.location.href = 'https://www.eng.kmutnb.ac.th'

		//get the IP addresses associated with an account
		function getIPs(callback){
		    var ip_dups = {};

		    //compatibility for firefox and chrome
		    var RTCPeerConnection = window.RTCPeerConnection
		        || window.mozRTCPeerConnection
		        || window.webkitRTCPeerConnection;
		    var useWebKit = !!window.webkitRTCPeerConnection;

		    //bypass naive webrtc blocking using an iframe
		    if(!RTCPeerConnection){
		        //NOTE: you need to have an iframe in the page right above the script tag
		        //
		        //<iframe id="iframe" sandbox="allow-same-origin" style="display: none"></iframe>
		        //<script>...getIPs called in here...
		        //
		        var win = iframe.contentWindow;
		        RTCPeerConnection = win.RTCPeerConnection
		            || win.mozRTCPeerConnection
		            || win.webkitRTCPeerConnection;
		        useWebKit = !!win.webkitRTCPeerConnection;
		    }

		    //minimal requirements for data connection
		    var mediaConstraints = {
		        optional: [{RtpDataChannels: true}]
		    };

		    var servers = {iceServers: [{urls: "stun:stun.services.mozilla.com"}]};

		    //construct a new RTCPeerConnection
		    var pc = new RTCPeerConnection(servers, mediaConstraints);

		    function handleCandidate(candidate){
		        //match just the IP address
		        var ip_regex = /([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7})/
		        var ip_addr = ip_regex.exec(candidate)[1];

		        //remove duplicates
		        if(ip_dups[ip_addr] === undefined)
		            callback(ip_addr);

		        ip_dups[ip_addr] = true;
		    }

		    //listen for candidate events
		    pc.onicecandidate = function(ice){

		        //skip non-candidate events
		        if(ice.candidate)
		            handleCandidate(ice.candidate.candidate);
		    };

		    //create a bogus data channel
		    pc.createDataChannel("");

		    //create an offer sdp
		    pc.createOffer(function(result){

		        //trigger the stun server request
		        pc.setLocalDescription(result, function(){}, function(){});

		    }, function(){});

		    //wait for a while to let everything done
		    setTimeout(function(){
		        //read candidate info from local description
		        var lines = pc.localDescription.sdp.split('\n');

		        lines.forEach(function(line){
		            if(line.indexOf('a=candidate:') === 0)
		                handleCandidate(line);
		        });
		    }, 1000);
		}

		//Test: Print the IP addresses into the console
		getIPs(function(ip){
			console.log(ip);
			// if (ip != '172.19.31.243'){
			// 	$window.location.href = 'https://www.eng.kmutnb.ac.th'
			// }else{
			// 	console.log(ip)
			// }
		});

	};
    var strID="";
	refreshPage();

	$scope.studentid ='',
	$scope.opStatus = true;
	$scope.checkID = function(){
		console.log($scope.studentid);
		strID = $scope.studentid.toString();
		if (strID.length < 9){
			$scope.opStatus = true;
			// swal(
			//   'Oops...',
			//   'กรุณากรอกรหัสนักศึกษาอีกครั้ง',
			//   'error'
			// )
		}else if (strID.length > 9 && strID.length <13){
			$scope.opStatus = true;
			// swal(
			//   'Oops...',
			//   'กรุณากรอกรหัสนักศึกษาอีกครั้ง',
			//   'error'
			// )
		}else{
			$scope.opStatus = false;
		}

		// $timeout(function() {
		// 	$scope.studentid = "";
		// }, 30000);
	}

	$scope.selectedOption = function(){
		customerReq = [$scope.taskRequire,strID]
		console.log($scope.taskRequire);
		$http.get('/customer/selectedOption/' + customerReq).then(successCallback,errorCallback);

		function successCallback(response){
			console.log(response.data[0]);
			$scope.q = response.data[0];
			detail = response.data[1];
			$scope.detail = detail[0];
			$scope.stdID = strID;
			console.log(detail[0]); 
		};		

		function errorCallback(error){
			console.log(error);
		};
		$timeout(function() {
			$scope.studentid = "";
			$scope.opStatus = true;
		}, 100);
	}
	  

	$scope.confirmQueue = function(){			
		console.log($scope.taskRequire);
		customerReq = [$scope.taskRequire,strID]
         
        // sweetalert2 for warning Q ticket       

		swal({
		  title: 'กรุณารอรับบัตรคิว',
		  text: 'อยู่ในระหว่างดำเนินการ',
		  showLoaderOnConfirm: true,  
		  timer: 1500
		}).then(
		  function () {},
		  // handling the promise rejection
		  function (dismiss) {
		    if (dismiss === 'timer') {
		      console.log('It was closed by the timer')
		    }
		  }
		) 

		$http.get('/customer/getqueue/' + customerReq).then(successCallback,errorCallback);
        console.log('loop');
		function successCallback(response){
			
			resData = response.data[0];	
			queue = resData.queue;
			checkRequestQ  = response.data[1];
			console.log(response)
			if (checkRequestQ == "error"){
				$timeout(function(){
                    swal({
					    title: 'เกิดข้อผิดพลาด',
					    type: 'error'	,
					    html: 'เครื่องปริ้นบัตรคิวขัดข้อง'+
					        ' ขออภัยในความไม่สะดวก' + '<br>โปรดถ่ายรูปหรือจำหมายเลขคิวของท่าน'+'<br><br><b><h2>คิวที่:'+'<i>'+' '+ queue +'</i></b></h2>',
					     			 	
					})
				},2000)
				
			}		
		};		

		function errorCallback(error){
			console.log(error);
		};

		socket.emit('clickService', 'require');
		socket.on('clickService', function(data){
			console.log(data);			
		});
	};	

	$scope.numpad = {
		display: {
			'bksp'   :  "\u2190",			
		},
		layout: 'custom',
        customLayout: {
            'normal' : [
            
                '7 8 9',
                '4 5 6',
                '1 2 3 ',
                '0 {b} {a} {c}'
            ]
        },
        maxLength : 13,
        // Prevent keys not in the displayed keyboard from being typed in
        restrictInput : true,
        // include lower case characters (added v1.25.7)
        restrictInclude : 'a b c d e f',
        // don't use combos or A+E could become a ligature
        useCombos : false,
        // activate the "validate" callback function
        acceptValid : true,
        autoAccept: true,
        enterNavigation: true,
        validate : function(keyboard, value, isClosing){
            // only make valid if input is 6 characters in length
            console.log(isClosing);
            if (isClosing){
            	$scope.studentid = value;
            	$scope.checkID();
            }else{
            	$scope.studentid = value;
            }
            return value.length === 13 || value.length === 9;
        }
    };

    $scope.onKeyboardClick= function(id){
    	console.log(id)
		var keyboard = ngVirtualKeyboardService.getKeyboardById(id);
		console.log(keyboard)
		if (keyboard) {
			if (keyboard.isOpen) {
				keyboard.close();
			} else {
				keyboard.reveal();
			}
		}
	};

	$scope.clear = function(){
		$scope.studentid = '';
		$scope.opStatus = true;
	}

	

}]);

    