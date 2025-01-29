const express = require('express')
const path = require('path')
const app = express()
const port = process.env.PORT || 3000
const server = app.listen(port,()=>console.log(`server started at port ${port}`))

const io = require('socket.io')(server)

app.use(express.static(path.join(__dirname,"public")))


const scores = ["high card","pair","two pair","three of a kind","straight","flush","full house","four of a kind","straight flush","royal flush"]
const high_card_ranking= ['2','3','4','5','6','7','8','9','0','J','Q','K','A']
const deck = [
    "c2","c3","c4","c5","c6","c7","c8","c9","c0","cJ","cQ","cK","cA",
    "d2","d3","d4","d5","d6","d7","d8","d9","d0","dJ","dQ","dK","dA",
    "h2","h3","h4","h5","h6","h7","h8","h9","h0","hJ","hQ","hK","hA",
    "s2","s3","s4","s5","s6","s7","s8","s9","s0","sJ","sQ","sK","sA"
]

const newGame = () => {
    return {
        players:[],
        deck:[...deck],
        discard:[]
    }
}

const newPlayer = (money=0,name="Player",socket="") => {
    return {
        cards:[],
        money:money,
        name:name,
        socket:socket
    }
}


const games = {
    "a":{
        players:[]

    }
}

get_points=(hand)=>{
    const flush = hand.every(x=>x[0]===hand[0][0])
    const uniq = hand.reduce((akk,el)=>{
        if (!akk.some(x=>x===el[1])){akk.push(el[1])}
        return akk
    },[])
    const count = uniq.map(x=>{
        return [x,hand.filter(y=>y[1]===x).length]
    })
    const values = hand.map(x=>high_card_ranking.indexOf(x[1]))
    const values_sorted = values.sort((a,b)=>a-b)
    const straight = values_sorted.reduce((akk,el,id)=>{
        if (id !== 0 && akk){
            return values_sorted[id-1]===el-1
        }
        else{return akk}
    },true) 
    if (straight & flush){
        return (values_sorted[4]===12)?9:8
    }
    else if (flush){return 5}
    else if (straight){return 4}
    else if (count.length == 2){
        return (count[0][1]===1 || count[0][1]===4)?7:6
    }
    else if (count.some(x=>x[1]===3)){return 3}
    const pairs = count.filter(x=>x[1]===2)
    return pairs.length
}


// app.get("/cards",)

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