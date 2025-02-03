const express = require('express')
const api = express.Router()
const ACCESS_TOKEN = "esrxdghju89ygt6yghuiy6trfcgvhbyhug76trfvghbhyugtrfcgvby"
// const uuid = require('u')
const jwt = require('jsonwebtoken')









const check_token = (req,res,next)=>{
    // console.log(req.headers['authorisation'])
    if (!req.headers['authorisation']){
        // console.log("rendering redirect...")
        // res.render("account_redirect", {username:req.params.username})
        // res.render("login")
        res.sendStatus(401)
    }
    else{
        const header_value = req.headers['authorisation'].split(" ")
        if (header_value.length === 2){
            token = header_value[1]
            if (!token){
                // res.render("login")
                res.sendStatus(401)
            }
            else{
                req.token = token
                next()}
        }
        else{
            // res.render("login")
            res.sendStatus(401)
        }
    }
}
const authorise = (req,res,next) =>{
    const token = req.token
    jwt.verify(token,ACCESS_TOKEN,(error,data)=>{
        if(error){
            // res.render("login")
            res.sendStatus(403)}
        else{
            req.user = data
            next()}
    })
}
const check_user = (req,res,next) =>{
    if (req.params === req.user.username){
        next()
    }
    
}


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
const newGame = (name,owner) => {
    return {
        players:[],
        deck:[...deck],
        discard:[],
        name:name,
        owner:owner
    }
}
const newPlayer = (name,socket="",money=0) => {
    return {
        cards:[],
        money:money,
        name:name,
        socket:socket
    }
}
const newUser= (username="User",password="",id="") => {
    return {
        money:100,
        username:username,
        password:password,
        game:""
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


api.post("/login",(req,res)=>{
    const username= req.body.username
    const password= req.body.password
    const id = users.findIndex(x=>x.username === username)
    if (id===-1){res.status(404).send({message:"No account with that name"})}
    else{
    if (users[id].password === password){
        token = jwt.sign(users[id],ACCESS_TOKEN)

        res.status(200).send({token})
    }
    else{
        res.status(400).send({message:"Incorrect password"})
    }}
})

api.get("/account/:username",check_token,authorise,check_user,(req,res)=>{
    const user = req.user
    // console.log(user)
    res.send(user)
})

api.get("/user",check_token,authorise, (req,res)=>{
    res.status(200).send({user:req.user})
})

api.post("/signup",(req,res)=>{
    const username = req.body.username
    const password = req.body.password
    if (users.some(x=>x.username===username)){
        res.status(400).send({message:"Account with that username exists"})}
    else{
        users.push(newUser(username,password))
        res.sendStatus(200)
    }
})

const users = [
    {username:"Paweł",password:"password",money:100,game:""},
    {username:"Lolek",password:"aaaaaaa",money:10000,game:"test"},
    {username:"Karol",password:"klakson",money:100,game:""}
]
const games = [
    {
        players:[],
        deck:[...deck],
        discard:[],
        name:"game",
        owner:"Karol",
        chat_log:[]
    }
]

// api.post("/",(req,res)=>{
//     console.log(req.body)
// })

// api.get("/joingame"){

// }

api.get("/draw/:amount",check_token,authorise,(req,res)=>{
    console.log(req.user)
    const result =drawCards(req.params.amount)
    res.send({cards:result})
})

api.get("/game/:game",check_token,authorise,(req,res)=>{
    const game_name = req.params.game 
    const user = req.user
    const game = games.find(x=>x.name===game_name)
    if(game){
        const player_id = game.players.findIndex(x=>x.name===user.name)
        if (player_id !== -1){
            const players = game.players.map(x=>{
                return x.name
            }
            )
            res.status(200).send({players:players,cards:game.players[player_id].cards})
        }
        else{
            res.status(400).send({message:"Not in game"})
        }}
    else{res.status(404).send({message:"No game with that name"})}
    
})

api.post("/join-game",check_token,authorise,(req,res)=>{
    const user = req.user
    const name = req.body.name
    // console.log(user)
    if (!games.some(x=>x.name===name)){
        res.status(404).send({message:"A game with that name doesn't exist"})}
    else{
        const game_id = games.findIndex(x=>x.name===name)
        //może dodać sockety
        if (games[game_id].players.length === 4){
            res.status(400).send({message:"Game full"})
        }
        else{
            if (games[game_id].players.some(x=>x.name===user.username)){
                res.status(400).send({message:"Already in game"})
            }
            else{
                games[game_id].players.push(newPlayer(user.username))
                res.sendStatus(200)
            }
        }
            
    }
})

api.get("/poker",(req,res)=>{
    res.status(200).send({games})
})

api.post("/create-poker",check_token,authorise,(req,res)=>{
    const user = req.user
    const name = req.body.name
    if (games.some(x=>x.name===name)){
        res.status(400).send({message:"A game with that name exists"})}
    else{
        games.push(newGame(name,user.name))
        res.sendStatus(200)
    }
})

// api.get("/draw/:game/:amount",check_token,authorise,(req,res)=>{
//     console.log(req.user)
//     const result =drawCards(req.params.amount)
//     res.send({cards:result})
// })

module.exports = api