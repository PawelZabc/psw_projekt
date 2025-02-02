const express = require('express')
const router = require("./routes/index.js")
// const path = require('path')
const app = express()
const port = process.env.PORT || 3000
const server = app.listen(port,()=>console.log(`server started at port ${port}`))
const jwt = require('jsonwebtoken')
const api = require("./routes/api.js")

app.set('views', "views");
// app.engine('html', require('ejs').renderFile);
app.set('view engine', 'ejs');

const jwb = require('jsonwebtoken')



app.use(express.json())

const io = require('socket.io')(server)

//add env to access token
const ACCESS_TOKEN = "esrxdghju89ygt6yghuiy6trfcgvhbyhug76trfvghbhyugtrfcgvby"

app.use(express.static("public/"))
app.use("/",router)
app.use("/api",api)
// app.use("/api",api)
const users = [
    {username:"Paweł",password:"password"},
    {username:"Lolek",password:"aaaaaaa"},
    {username:"Karol",password:"klakson"}
]

const authorise= (req,res,next) =>{
    // console.log(req.headers)
    // req.user = {beep:"meep"}
    // next()
    token = req.headers['authorisation'].split(" ")[1]
    if(!token){res.sendStatus(401)}
    jwt.verify(token,ACCESS_TOKEN,(error,data)=>{
        if(error){res.sendStatus(403)}
        else{
            req.user = data
            next()}
        
    })
}

// const cors = require("cors");
// app.use(cors)
// app.use("/login",express.static(path.join(__dirname,"./public/login.html")))

// app.use(express.urlencoded({ extended: true }));

// const birds = require('./birds')

// app.use('/birds', birds)

const scores = ["high card","pair","two pair","three of a kind","straight","flush","full house","four of a kind","straight flush","royal flush"]
const high_card_ranking= ['2','3','4','5','6','7','8','9','0','J','Q','K','A']
const deck = [
    "c2","c3","c4","c5","c6","c7","c8","c9","c0","cJ","cQ","cK","cA",
    "d2","d3","d4","d5","d6","d7","d8","d9","d0","dJ","dQ","dK","dA",
    "h2","h3","h4","h5","h6","h7","h8","h9","h0","hJ","hQ","hK","hA",
    "s2","s3","s4","s5","s6","s7","s8","s9","s0","sJ","sQ","sK","sA"
]
function drawCards(amount){
    const a = amount-0
    const empty = Array(a).fill(null);
    const result = empty.map(x=>{
        return deck[Math.floor(Math.random() * deck.length)]
        // if (deck.length === 0){
        //     console.log("no more cards")
        //     return null}
        // else{ 
        //     card = Math.floor(Math.random() * deck.length);
        //     return deck.splice(card,1)[0]}
    })
    return result
    
}
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
const getPoints=(hand)=>{
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


app.post("/api/login",(req,res)=>{
    const username= req.body.username
    const password= req.body.password
    console.log(username,password)
    const id = users.findIndex(x=>x.username === username)
    if (id===-1){res.sendStatus(404)}
    else{
    if (users[id].password === password){
        token = jwb.sign(users[id],ACCESS_TOKEN)

        res.status(200).send({token})
    }
    else{
        res.sendStatus(400)
    }}
})

// app.get("/",(req,res)=>{
//     res.render('index')
// })

// app.get("/login",(req,res)=>{
//     res.render('login.html')
// })

// app.get("/games",(req,res)=>{
//     res.send(games)
// })


app.post("/check",(req,res)=>{
    console.log(req.body)
})

app.get("/draw/:amount",authorise,(req,res)=>{
    console.log(req.user)
    const result =drawCards(req.params.amount)
    res.send({cards:result})
})

io.on('connection', socket => {
    console.log(`Client connected id:${socket.id}`);
    socket.on("join-room",({room})=>{
      socket.join(room)
      console.log("room joined")
      socket.to(room).emit("user-joined", "someone")
      socket.on("message",({who,msg})=>{
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