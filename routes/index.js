const express = require('express')
const router = express.Router()


router.get("/",(req,res)=>{
    res.render("index")
})

router.get("/login",(req,res)=>{
    res.render("login")
})

router.get("/game",(req,res)=>{
    res.render("game")
})

module.exports = router