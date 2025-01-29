const { next } = require('next');

const app = require('express')();

// app.use(cors)

const server = require('http').createServer(app);
// const io = require('socket.io')(server);

// io.on('connection', socket => {
//     console.log(`Client connected id:${socket.id} what`);
//     socket.on("join-room",({room})=>{
//       socket.join(room)
//       console.log("room joined")
//       socket.to(room).emit("user-joined", "yay")
//       socket.on("message",(msg)=>{
//         socket.to(room).emit("message", msg)
//       })
      

//     })
//     socket.on('disconnect', () => {
//       console.log('Client disconnected');
//     });
//   });

app.get("/",function (req, res) {
    res.send(["c2","c7"])
  })


server.listen(8080);