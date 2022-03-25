const express = require('express')
const bodyParser = require('body-parser')
const { check , validationResult } = require('express-validator')
const mysql = require('mysql')

const app = express()
const port = process.env.PORT || 5000

const urlencodedParser = bodyParser.urlencoded({extended:false})

app.use(bodyParser.urlencoded({ extended: false }))

app.use(bodyParser.json())

app.set('view engine','ejs')

// MySQL
const pool = mysql.createPool({
    connectionLimit : 10,
    host            : 'localhost',
    user            : 'root',
    password        : '',
    database        : 'nodejs_beers'
})


app.get('/additems' ,(req,res) => {
    res.render('additems')
})

var obj = {}

// Get all beers
app.get('', (req, res) => {
    
    pool.getConnection((err, connection) => {
        if(err) throw err
        console.log(`connected as id ${connection.threadId}`)

        connection.query('SELECT * from beers', (err, rows) => {
            connection.release() // return the connection to pool

            if(!err) {
                //res.send(rows)
                obj = {print : rows}
                res.render('index',obj)
            } else {
                console.log(err)
            }

        })
    })
    
})

// Get a beer by ID
app.get('/:id', (req, res) => {

    pool.getConnection((err, connection) => {
        if(err) throw err
        console.log(`connected as id ${connection.threadId}`)

        connection.query('SELECT * from beers WHERE id = ?', [req.params.id], (err, rows) => {
            connection.release() // return the connection to pool

            if(!err) {
               // res.send(rows)
               obj = {print : rows}
                res.render('index',obj)
            } else {
                console.log(err)
            }

        })
    })
})


app.get('/getname_id/:name&:id', (req, res) => {

    pool.getConnection((err, connection) => {
        if(err) throw err
        console.log(`connected as id ${connection.threadId}`)

        connection.query('SELECT * from beers WHERE name like ? or id = ?', [req.params.name , req.params.id], (err, rows) => {
            connection.release() // return the connection to pool

            if(!err) {
               // res.send(rows)
               obj = {print : rows}
                res.render('index',obj)
            } else {
                console.log(err)
            }

        })
    })
})


// Delete a records / beer
app.delete('/:id', (req, res) => {

    pool.getConnection((err, connection) => {
        if(err) throw err
        console.log(`connected as id ${connection.threadId}`)

        connection.query('DELETE from beers WHERE id = ?', [req.params.id], (err, rows) => {
            connection.release() // return the connection to pool

            if(!err) {
                res.send(`Beer with the Record ID: ${[req.params.id]} has been removed.`)
            } else {
                console.log(err)
            }

        })
    })
})

// Add a record / beer
app.post('/additems', urlencodedParser, [
    check('id','This is an id , it must 3+ charecters ')
        .exists()
        .isLength({min : 3}),
    check('name','This is a name of items' )
        .exists(),
    check('tagline' , 'Tagline is only number')
        .exists()
        .isNumeric()
], (req, res) => {

    pool.getConnection((err, connection) => {
        if(err) throw err
        console.log(`connected as id ${connection.threadId}`)

        const errors = validationResult(req)
        if (!errors.isEmpty()){
            const alert = errors.array()
            res.render('additems', {
                alert
            })
        }else{
            const params = req.body

            connection.query('INSERT INTO beers SET ?', params , (err, rows) => {
                connection.release() // return the connection to pool

                if(!err) {
                    res.send(`Beer with the name: ${params.name} has been added.`)
                } else {
                    console.log(err)
                }
            })
        }
        console.log(req.body)
    })
})


// Update a record / beer
app.put('', (req, res) => {

    pool.getConnection((err, connection) => {
        if(err) throw err
        console.log(`connected as id ${connection.threadId}`)

        const { id, name, tagline, description, image } = req.body

        connection.query('UPDATE beers SET name = ?, tagline = ?, description = ?, image = ? WHERE id = ?', [name, tagline, description, image, id] , (err, rows) => {
            connection.release() // return the connection to pool

            if(!err) {
                res.send(`Beer with the name: ${name} has been added.`)
            } else {
                console.log(err)
            }

        })

        console.log(req.body)
    })
})



// Listen on enviroment port or 5000
app.listen(port, () => console.log(`Listen on port ${port}`))