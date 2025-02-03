const express = require('express')
const router = require("./routes/index.js")
const api = require("./routes/api.js")
const app = express()
const port = process.env.PORT || 3000
const server = app.listen(port,()=>console.log(`server started at port ${port}`))



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
    socket.on("join-room",({room})=>{
    //   socket.join(room)
      console.log(`${room} joined`)
      socket.to(room).emit("user-joined", "someone")
      socket.on("message",({who,msg})=>{
        console.log(who,msg)
        console.log(room)
        socket.to(room).emit("message", {who:who,msg:msg})
      })
      socket.on("start",(who)=>{
        socket.to(room).emit("message",{msg:`${who} drew 5 cards`,who:""})
      })

      socket.on("swap",({who,amount})=>{
        socket.to(room).emit("message", {msg:`${who} swapped ${amount} cards`,who:""})
      })
      socket.on("check",({who,hand})=>{
        socket.to(room).emit("message", {msg:`${who} has ${scores[getPoints(hand)]}`,who:""})
      })
    })
    socket.on('disconnect', () => {
        // socket.to(room).emit("message", `someone left`)
      console.log('Client disconnected');
    });
  });