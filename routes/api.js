const express = require('express')
const api = express.Router()
const ACCESS_TOKEN = "esrxdghju89ygt6yghuiy6trfcgvhbyhug76trfvghbhyugtrfcgvby"
// const uuid = require('u')
const jwt = require('jsonwebtoken')
const { connect } = require('.')









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
    if (users[req.user]){
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
function drawCards(amount,game){
    const a = amount-0
    const empty = Array(a).fill(null);
    const result = empty.map(x=>{
        // return deck[Math.floor(Math.random() * deck.length)]
        card = Math.floor(Math.random() * games[game].deck.length);
        return games[game].deck.splice(card,1)[0]
    })
    return result
    
}
const newGame = (name,owner) => {
    games[name]={
        name:name,
        cards:[],
        players:[],
        deck:[...deck],
        owner:owner,
        chat_log:[],
        state:0,
        end_auction:0,
        next_player:0
    }
}
const newPlayer = (name,socket) => {
    return {
        cards:[],
        name:name,
        connected:true,
        bet:0,
        action:"",
        fold:false,
        ready:false,
        socket:socket
    }
}
const newUser= (name="User",password="") => {
    users[name]={
        money:100,
        password:password,
        name:name
    }
}
const users = {
    "Paweł":{name:"Paweł",password:"password",money:100},
    "Lolek":{name:"Lolek",password:"aaaaaaa",money:10000},
    "Karol":{name:"Karol",password:"klakson",money:100},
    "Ka":{name:"Karol",password:"klakson",money:100}
}
const games = {
    game:
    {
        players:[],
        deck:[...deck],
        cards:[],
        name:"game",
        owner:"Karol",
        chat_log:[],
        state:0,
        end_auction:0,
        next_player:0
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
    const name= req.body.name
    const password= req.body.password
    const names = Object.keys(users)
    if (!names.some(x=>x===name)){res.status(404).send({message:"No account with that name"})}
    else{
    if (users[name].password === password){
        token = jwt.sign(users[name],ACCESS_TOKEN)
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

api.delete("/account/:username",check_token,authorise,(req,res)=>{
    const user = req.user
    console.log(users[user.name])
    console.log(req.params.username)
    if (users[user.name] && user.name === req.params.username){
        delete users[user.name]
        res.status(200).send({message:"Account deleted"})
    }
    else{
        res.status(400).send({message:"not deleted account"})
    }
    // console.log(user)
    
})

api.get("/user",check_token,authorise,check_user, (req,res)=>{
    res.status(200).send({user:req.user})
})



api.post("/signup",(req,res)=>{
    const name = req.body.name
    const password = req.body.password
    if (Object.keys(users).some(x=>x===name)){
        res.status(400).send({message:"Account with that username exists"})}
    else{
        newUser(name,password)
        token = jwt.sign(users[name],ACCESS_TOKEN)
        res.status(200).send({token})
    }
})



// api.post("/",(req,res)=>{
//     console.log(req.body)
// })

// api.get("/joingame"){

// }

api.get("/start/:game/",check_token,authorise,(req,res)=>{
    const user = req.user
    const game = req.params.game
    // const amount = req.body.amount 
    if (games[game].state === "starting"){
        const result = drawCards(2,game)
        games[game].players.find(user.name).cards = result
        games[game].players.find(user.name).action = "waiting"
        res.status(200).send({cards:result})}
    else{
        res.status(400).send({message:"Game is not starting"})}
    
})

api.post("/draw/:game/",check_token,authorise,(req,res)=>{
    const user = req.user
    const game = req.params.game
    const amount = req.body.amount 
    const result =drawCards(req.body.amount,req.params.game,req.user)
    res.send({cards:result})
})

api.get("/game/:game",check_token,authorise,(req,res)=>{
    const game_name = req.params.game 
    const user = req.user
    const game = games[game_name]
    if(game){
        const player_id = game.players.findIndex(x=>x.name===user.name)
        const players = game.players.map(x=>{
            return x.name
        })
        if (player_id !== -1){
            res.status(200).send({players:players,cards:game.players[player_id].cards,table:game.cards})
        }
        else{
            res.status(200).send({players})
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
    // const result = Object.keys
    res.status(200).send({games})
})

api.post("/create-poker",check_token,authorise,(req,res)=>{
    const user = req.user
    const name = req.body.name
    if (games[name]){
        res.status(400).send({message:"A game with that name exists"})}
    else{
        newGame(name,user.name)
        res.sendStatus(200)
    }
})

// api.get("/draw/:game/:amount",check_token,authorise,(req,res)=>{
//     console.log(req.user)
//     const result =drawCards(req.params.amount)
//     res.send({cards:result})
// })

module.exports = { api , users , games , newPlayer,getPoints,drawCards,deck}