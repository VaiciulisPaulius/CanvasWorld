const express = require('express')

const app = express()
const server = require('http').createServer(app)

const mysql = require("mysql2")
const bodyParser = require('body-parser')
const cors = require('cors')
const fs = require('fs')
const path = "C:/ProgramData/MySQL/MySQL Server 8.0/Uploads/canvas.csv"
const { Parser } = require('json2csv');

const WebSocket = require("ws")
const { stringify } = require('querystring')
const wss = new WebSocket.Server({ server: server })

let config = require('./config');

const db = mysql.createPool({
    connectionLimit: 2,
    host: config.development.database.host,
    user: config.development.database.user,
    password: config.development.database.password,
    database: config.development.database.db
})

app.use(cors())
app.use(express.json())
app.use(bodyParser.urlencoded({extended: true}))

wss.on('connection', ws => {
    console.log('A new client Connected!')
})

wss.broadcast = (offset, value) => {
    wss.clients.forEach(client => {
        let answer = {offset: offset, value: value}
        console.log(answer)
        client.send(JSON.stringify(answer))
    })
}

app.get("/api/canvas/get", (req, res) => {
    const sqlSelect = `SELECT value AS v FROM canvas`;
    db.query(sqlSelect, (err, result) => {
        if(result != undefined && result.length !== 0) {
            let arr = []
            result.forEach(val => {
                arr.push(val.v)
            })
    
            console.log(arr)
            res.send(arr)
        }
    })
})
app.put("/api/canvas/draw/put",  (req, res) => {
    const offset = req.body.offset
    const value = req.body.value

    console.log(offset, value)
    if(value >= 0 && value <= 255 && offset >= 0 && offset < 184899) {
        const sqlUpdate = "UPDATE canvas SET value = ? WHERE offset = ?;"

        db.query(sqlUpdate, [value, offset], (err, result) => {
            if(err == null) console.log(`Updated pixel #${offset} of ${value} value`)
            console.log(err)
            res.send(true)
            //if(err == undefined) 
            wss.broadcast(offset, value)
            })
        }
    else res.send("Invalid Input.")
})
// app.use(function (request, response) {
//     response.header("Access-Control-Allow-Origin", "*");
//     response.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
// });

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
    console.log("running on port " + PORT)
})


// app.post("/api/insert", (req, res) => {
//     const movieName = req.body.movieName
//     const movieReview = req.body.movieReview

//     const sqlInsert = "INSERT INTO movie_reviews (movieName, movieReview) VALUES (?, ?)"

//     db.query(sqlInsert, [movieName, movieReview], (err, result) => {
//         console.log(err)
//     })
// })
// app.delete('/api/delete/:movieName', (req, res) => {
//     const name = req.params.movieName
//     const sqlInsert = "DELETE FROM movie_reviews WHERE movieName = ?"
//     db.query(sqlInsert, name, (err, result) => {
//         console.log(err)
//     })

// })
// app.get("/", (req, res) => {
//     let sqlStatement = "INSERT INTO canvas (offset, value) VALUES "

//     for(let y = 0; y < 430; y++) {
//         for(let x = 0; x < 430; x++) {
//             let offset = x + (y * 430)
//             //let value = offset % 2 === 0 ? 0 : 255
//             let value = 7
//             sqlStatement += `('${offset}', '${value}'), `
//         }
//     }
//     sqlStatement += `('2000000', '5');`


//     db.query(sqlStatement, (err, result) => {
//         console.log(err)
//     })
// })