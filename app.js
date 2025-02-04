const express = require('express')
const router = require("./routes/index.js")
const api_router = require("./routes/api.js")
const app = express()
const port = process.env.PORT || 3000
const server = app.listen(port,()=>console.log(`server started at port ${port}`))

const api = api_router.api
const games = api_router.games
const users = api_router.users
const deck = api_router.deck
const newPlayer = api_router.newPlayer
const drawCards = api_router.drawCards
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
      if(games[room]){
        const id = games[room].players.findIndex(x=>x.name===username)
      if(!(id !== -1 && games[room].players[id].connected === true)){
      if (games[room].players.length<=4 || (id !== -1 && games[room].players[id].connected === false)){
        if(!games[room].players.some(x=>x.name===username))
          {
            games[room].players.push(newPlayer(username,socket.id))}
        else{
          const id = games[room].players.findIndex(x=>x.name===username)
          if (games[room].players[id].connected === true){}
          else{games[room].players[id].connected = true}
        }
        
        socket.join(room)
        // console.log(`${room} joined`)
        socket.to(room).emit("user-joined", username)
        io.to(socket.id).emit("new-number",{number:games[room].players.length})
        
        socket.on("message",({msg})=>{
          games[room].chat_log.push({msg:msg,who:msg})
          io.to(room).emit("message", {who:username,msg:msg})
        })


        socket.on("start",()=>{
          if (games[room].state === 0 && games[room].players[games[room].players.findIndex(x=>x.name===username)].action!=="ready"){
          games[room].players[games[room].players.findIndex(x=>x.name===username)].action="ready"
          io.to(room).emit("message",{msg:`${username} is ready`,who:""})
          if(games[room].players.every(x=>x.action==="ready") && games[room].players.length >= 2){
            games[room].players.forEach((x,i)=>{
              if(i===0){
                games[room].players[i].action = "waiting"
              }
              else{games[room].players[i].action = "none"}
          })
            games[room].state = 1
            io.to(room).emit("new-state",({cards:[],number:games[room].state}))
            // games[room].cards = drawCards(3,room)
            games[room].players.forEach((x,i) => {
              games[room].reward += 5
              users[x.name].money -=5
              x.cards = drawCards(2,room)
            });
            io.in(room).emit("start")
            io.to(room).emit("new-waiting",{number:1})
          }}
        })

        // socket.on("swap",({amount})=>{
        //   io.to(room).emit("message", {msg:`${username} swapped ${amount} cards`,who:""})
        // })
        const next = () =>{
          games[room].next_player+=1
            if (games[room].next_player===games[room].players.length){
              games[room].next_player=0
            }
            if ((games[room].next_player !== games[room].end_auction)){
              const next_player = games[room].players[games[room].next_player]
            if (next_player.connected===false || next_player.action==="fold"){
              games[room].players[games[room].next_player].action = "fold"
              next()
            }
            else{
              io.to(room).emit("new-waiting",{number:games[room].next_player+1})
            }
            }
            else{
              games[room].state += 1
              
              if (games[room].state ===5){
                games[room].cards = []
                games[room].deck = [...deck]
                games[room].state = 0
                io.to(room).emit("end-game")
              }
              else{
                io.to(room).emit("new-waiting",{number:1})
                if(games[room].state===2){
                  const cards = drawCards(3,room)
                  cards.forEach((x,i)=>{
                    games[room].cards.push(x)
                  })}
                else{games[room].cards.push(drawCards(1,room)[0])}
              }
              games[room].next_player=0
              io.to(room).emit("new-state",({cards:games[room].cards,number:games[room].state}))
              // io.to(room).emit("end-auction")
              console.log("end of auction")
            }
            

        }
        socket.on("check",()=>{
          const id =games[room].players.findIndex(x=>x.name===username)
          if (games[room].state !== 0 && games[room].next_player===id){
            io.to(room).emit("message", {msg:`${username} has checked`,who:""})
            const amount = (games[room].bid-games[room].players[id].bet)
            users[username].money-=amount
            games[room].reward += amount
            io.to(room).emit("new-reward",{number:games[room].reward})
            games[room].players[id].bet=games[room].bid
            next()
          }
          // io.to(room).em
          // it("message", {msg:`${username} has checked`,who:""})
        })

        socket.on("call",()=>{
          io.to(room).emit("message", {msg:`${username} has called`,who:""})
        })

        socket.on("raise",({amount})=>{
          if (games[room].state !== 0 && games[room].next_player===games[room].players.findIndex(x=>x.name===username)){
          io.to(room).emit("message", {msg:`${username} has raised by ${amount}`,who:""})
          const id = games[room].players.findIndex(x=>x.name===username)
          const diff = games[room].bid - games[room].players[id].bet
          games[room].bid+=amount
          games[room].players[id].bet += diff
          users[username].money-=diff
          games[room].reward += diff
          games[room].end_auction = id
          io.to(room).emit("new-bid",{number:games[room].bid})
          io.to(room).emit("new-bet",{number:games[room].bid})
          io.to(room).emit("new-reward",{number:games[room].reward})
          next()
        }})

        socket.on("fold",()=>{
          if (games[room].state !== 0 && games[room].next_player===games[room].players.findIndex(x=>x.name===username)){
          io.to(room).emit("message", {msg:`${username} has folded`,who:""})
          const id = games[room].players.findIndex(x=>x.name===username)
          games[room].players[id].action = "fold"
          const not_folded = games[room].players.filter(x=>x.action="fold")
          if (not_folded.length === 1){
            console.log(not_folded[0].name)
          }
          next()
        }})


        socket.on('disconnect', () => {
          
          const id = games[room].players.findIndex(x=>x.name===username)
          if (games[room].state === 0){games[room].players.splice(id,1)
            games[room].players.forEach((x,i)=>{
              io.to(x.socket).emit("new-number",{number:i+1})
            })
          }
          else(games[room].players[id].connected = false)
          io.to(room).emit("message", {msg:`${username} left`,who:""})
          // games[room].players.find(x=>x.name===username).connected = false
          
          
          
          console.log('Client disconnected');
      });
      
      }
    }
    }})
    
  });