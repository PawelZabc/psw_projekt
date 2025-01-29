const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require("socket.io");


// const express = require("express");
const cors = require("cors");
// const { Server } = require("socket.io");
// const http = require("http")
// const api = require("server/index.js")


// const app = express()
// const server = http.createServer(app);

// const io = new Server(server);

// const express = require('express')

// var cors = require('cors')



const cards = {

}

const players = {
  "a":{
    name : "null",
    cards : ["c2","c3","c4","c6","c8"]
  }
}


const app= next({ dev: process.env.NODE_ENV !== 'production' });
const handle = app.getRequestHandler();

// app.use(cors())

app.prepare().then(() => {
  // const server_exp = express()
  // server_exp.use(cors())
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  const io = new Server(server);

  io.on('connection', socket => {
    console.log(`Client connected id:${socket.id}`);
    socket.on("join-room",({room})=>{
      socket.join(room)
      console.log("room joined")
      socket.to(room).emit("user-joined", "yay")
      socket.on("message",(msg)=>{
        socket.to(room).emit("message", msg)
      })
      socket.on("change",(cards)=>{
        socket.to(room).emit("message", `user changed ${cards.length} cards`)
      })
      socket.on("start-clicked",()=>{
        socket.to(socket.id).emit("draw",["c2","c3"])
      })
      
      socket.on("change",(cards)=>{
        socket.to(room).emit("message", `user changed ${cards.length} cards`)
      })
      

    })
    socket.on('disconnect', () => {
      console.log('Client disconnected');
    });
  });

  server.listen(3000, (err) => {
    if (err) throw err;
    console.log('> Ready on http://localhost:3000');
  });
});