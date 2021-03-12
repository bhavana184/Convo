//FRONT END JS
var app = angular.module("myApp",[]);

app.controller("chatctrl",['$scope',function($scope){

	$scope.user={
		name:'',
		room:'',
		msg:''
	}
	$scope.userlist={
		users:''
	}
	// $scope.username='Bhavana';
	$scope.startChat = function($event){
		$event.preventDefault();//To stop proceeding if fields are not filled
		$scope.showFront = false;
		$scope.showChat = true;
		console.log('username: '+$scope.user.name+' room: '+$scope.user.room);

		//access enabled due to inclusion of socket.io.js script
		const socket=io();

		//join chatroom
		const username=$scope.user.name;
		const room=$scope.user.room;
		socket.emit('joinRoom',{ username, room});

		//Get  Users
		socket.on('roomUsers',({users})=>{
			outputUsers(users);
			// $scope.userlist.users=users;
			// console.log("$scope.userlist.users: "+$scope.userlist.users);
			// $scope.$digest();

		});

		// $scope.height=500;
		//message is the event created in server.js
		//message from server
		socket.on('message',message=>{
			// console.log("message from server: "+ message);
			outputMessage(message);
			//Scroll down, highlight that message
			// chatMessages.scrollTop=chatMessages.scrollHeight;
			// window.scrollTo(0,$scope.height );
			// window.scrollTo(0,document.querySelector(".chat-messages").scrollHeight);
			document.querySelector(".chat-messages").scrollTop=document.querySelector(".chat-messages").scrollHeight;
		});

		//Message submit
		//when we submit a form it automatically submit to a file
		//-->default behaviour of form

		$scope.sendMessage=function($event){
			$event.preventDefault();//prevent the default behaviour of the form

			// console.log("msg: "+$scope.user.msg);
			//get message text
			var msg=$scope.user.msg;
			//extracts value of element with id="msg"
			console.log("msg through event: "+ msg);
			//emitting a message to the server
			socket.emit('chatMessage',msg);

			//clear input of message field
			$scope.user.msg="";
			$scope.focus=true;//to have cursor pointer in message box
		}
		// output message to DOM
		function outputMessage(message){
			const div=angular.element('<div class="message" ><p class="meta">'+message.username+'   '+'<span>'+message.time+'</span></p><p class="text">'+message.text+'</p></div>')

			var target = document.querySelector('.chat-messages');
    	angular.element(target).append(div);
			// console.log(angular.element(target));
			// $scope.height+=64;

		}

		//Add users to DOM
		function outputUsers(users) {
			$scope.userlist.users=users;
			$scope.$digest();

		}



		// Chat room ends
	}
	$scope.leaveRoom = function(){
		window.location.reload();
		// $scope.showFront = true;
		// $scope.showChat = false;
		// $scope.user.name='';
		// $scope.user.room='';
	}


}]);
