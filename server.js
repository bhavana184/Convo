const path=require('path');
const http=require('http');
const express=require('express');
const socketio=require('socket.io');
const formatMessage=require('./utils/messages');
const {userJoin, getCurrentUser, userLeave, getRoomUsers}=require('./utils/users');


const app= express();
const server=http.createServer(app);
const io=socketio(server);

//Accesing frontend by making them static
app.use(express.static(path.join(__dirname,'public')));

const botName='ChatCord Bot';
io.on('connection',socket=>{
	console.log('New web socket connection...');

	socket.on('joinRoom',({username, room}) => {
		const user=userJoin(socket.id,username,room);
		console.log("socket.id: "+socket.id);
		socket.join(user.room);
		//Welcome current user
		// socket.emit('message','Welcome to ChatCord!');
		socket.emit('message',formatMessage(botName,`Hello ${user.username}, Welcome to ChatCord! You are in the ${user.room} room.`));

		//Broadcast when a user connects
		socket.broadcast.to(user.room).emit('message',formatMessage(botName,`${user.username} has joined the chat.`));//broadcast message to everyone except the current user

		//Send users and room info
		io.to(user.room).emit('roomUsers',{
			// room:user.room,
			users: getRoomUsers(user.room)
		});

	});

	//Listen for chatMessage
	socket.on('chatMessage',msg=>{
		const user=getCurrentUser(socket.id);
		// console.log("message from client: "+msg);
		io.to(user.room).emit('message',formatMessage(user.username,msg));
	});

	//Runs when client disconnects
	socket.on('disconnect',()=>{
		const user=userLeave(socket.id);
		if(user){
		io.to(user.room).emit('message',formatMessage(botName,`${user.username} has left the chat.`));

		//Send users and room info
		io.to(user.room).emit('roomUsers',{
			// room:user.room,
			users: getRoomUsers(user.room)
		});

	}

	});

});

// const PORT=3000||process.env.PORT;
const PORT=process.env.PORT||3000;
// app.listen(PORT,()=>console.log(`server running on port ${PORT}`));
server.listen(PORT,()=>console.log(`server running on port ${PORT}`));
