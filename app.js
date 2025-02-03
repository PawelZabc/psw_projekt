const express = require('express')
const router = require("./routes/index.js")
const api_router = require("./routes/api.js")
const app = express()
const port = process.env.PORT || 3000
const server = app.listen(port,()=>console.log(`server started at port ${port}`))

const api = api_router.api
const games = api_router.games
const users = api_router.users
const newPlayer = api_router.newPlayer
const getPoints = api_router.getPoints

app.set('views', "views");
app.set('view engine', 'ejs');


app.use(express.json())

const io = require('socket.io')(server)

//add env to access token


app.use(express.static("public/"))
app.use("/",router)
app.use("/api",api)


io.on('connection', socket => {
    console.log(`Client connected id:${socket.id}`);
    socket.on("join-room",({room,username})=>{
      // console.log(username)
      // console.log(room)
      // const game = games.findIndex(x=>x.name===room)
      // console.log(game)
      // const player = (game)?game.players.find(x=>x.username===username):false
      // console.log(games[room])
      if(games[room]){
      if (games[room].players.length!==4 || games[room].players.some(x=>x.name===username)){
        if(!games[room].players.some(x=>x.username===username))
          {games[room].players.push(newPlayer(username,socket.id))}
        socket.join(room)
        console.log(`${room} joined`)
        io.to(room).emit("user-joined", username)
        socket.on("message",({msg})=>{
          io.to(room).emit("message", {who:username,msg:msg})
        })
        socket.on("start",()=>{
          games[room].players.find(x=>x.name===username).action="ready"
          io.to(room).emit("message",{msg:`${username} is ready`,who:""})
          if(games[room].players.every(x=>x.action==="ready") && games[room].players.length > 0)
            {io.in(room).emit("start")}
        })
        socket.on("swap",({amount})=>{
          io.to(room).emit("message", {msg:`${username} swapped ${amount} cards`,who:""})
        })
        socket.on("check",({hand})=>{
          socket.to(room).emit("message", {msg:`${username} has ${scores[getPoints(hand)]}`,who:""})
        })}
        socket.on('disconnect', () => {
          // games[room].players.find(x=>x.name===username).action="ready"
          const id = games[room].players.findIndex(x=>x.name===username)
          games[room].players.splice(id,1)
          io.to(room).emit("message", {msg:`${username} left`,who:""})
          console.log('Client disconnected');
      });
    }})
    
  });