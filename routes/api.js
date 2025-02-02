const express = require('express')
const api = express.Router()


api.get("/draw/:amount",(req,res)=>{
    res.send("")
})

module.exports = api