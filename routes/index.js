const express = require('express')
const router = express.Router()


router.get("/",(req,res)=>{
    res.render("index")
})

router.get("/login",(req,res)=>{
    res.render("login")
})

router.get("/account",(req,res)=>{
    res.render("account")
})

router.get("/signup",(req,res)=>{
    res.render("signup")
})

router.get("/game",(req,res)=>{
    res.render("game")
})

router.get("/games",(req,res)=>{
    res.render("games")
})

module.exports = router