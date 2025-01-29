const express = require('express')
const path = require('path')
const router = express.Router()

// const timeLog = (req, res, next) => {
//   console.log('Time: ', Date.now())
//   next()
// }
// router.use(timeLog)

// define the home page route
router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, './public/index.html'));
})
// define the about route
router.get('/about', (req, res) => {
  res.send('About birds')
})

module.exports = router