const express = require('express')
const bodyParser = require('body-parser')
const { check , validationResult } = require('express-validator')
const mysql = require('mysql')
const { param } = require('express/lib/request')

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
var obj = {}

app.get('/additem' ,(req,res) => {
    res.render('additems',obj)
})
app.get('/delete' ,(req,res) => {
    
    pool.getConnection((err, connection) => {
        if(err) throw err
        console.log(`connected as id ${connection.threadId}`)

        connection.query('SELECT * from beers', (err, rows) => {
            connection.release() // return the connection to pool

            if(!err) {
                //res.send(rows)
                //model of Data using obj as glob {} and assign obj with diffrent var in app. 9ล9 // 
                obj = {beers : rows , err : err}
                res.render('delete',obj)
            } else {
                console.log(err)
            }

        })
    })
})





// Get all beers
app.get('', (req, res) => {
    
    pool.getConnection((err, connection) => {
        if(err) throw err
        console.log(`connected as id ${connection.threadId}`)

        connection.query('SELECT * from beers', (err, rows) => {
            connection.release() // return the connection to pool

            if(!err) {
                //res.send(rows)
                //model of Data using obj as glob {} and assign obj with diffrent var in app. 9ล9 // 
                obj = {beers : rows , Error : err}
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
               obj = {beers : rows , Error : err}
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
               obj = {beers : rows , Error : err}
                res.render('index',obj)
            } else {
                console.log(err)
            }

        })
    })
})


// Delete a records / beer
app.post('/delete', (req, res) => {
    var mesg
    pool.getConnection((err, connection) => {
        if(err) throw err
        console.log(`connected as id ${connection.threadId}`)
        const {id} = req.body
        

        connection.query('DELETE FROM `beers` WHERE `beers`.`id` = ?', [id], (err, rows) => {
            connection.release() // return the connection to pool

            if(!err) {
            //res.send(`${[id]} Complete`)
            mesg = `${[id]} is deleted`
        
            } else {
            mesg = "Failure , EMOTIONAL DAMAGE"
            }

        })
    })

    pool.getConnection((err, connection) => {
        if(err) throw err
        console.log(`connected as id ${connection.threadId}`)

        connection.query('SELECT * from beers', (err, rows) => {
            connection.release() // return the connection to pool
            obj = {beers : rows , err : err , mesg : mesg}

            if(!err) {
                //res.send(rows)
                //model of Data using obj as glob {} and assign obj with diffrent var in app. 9ล9 // 
                
                res.render('delete',obj)
            } else {
                
                res.render('delete',obj)
            }

        })
    })
})

// Add a record / beer
app.post('/additem', (req, res) => {
    pool.getConnection((err,connection)=>{
        if (err) throw err
            const params = req.body

        pool.getConnection((err,connection3)=>{
            connection3.query(`Select count(id) as count from beers where id = ${params.id}`,(err,rows)=>{
                connection3.release()
                if(!rows[0].count){
                    connection.query('INSERT INTO beers SET ?',params,(err,rows)=>{
                        if(!err){
                            obj = {err : err , mesg : `${params.name} is succesfully added ` }
                            //res.send(`${params.name} is succesfully added ` )
                            res.render('additems',obj)
                        }
                        else{
                            console.log(err)
                        }
                    })
                }
                else {
                    obj = {err : err , mesg : `${params.name} is failed  ` }
                    //res.send(`${params.name} is failed  ` )
                    res.render('additems',obj)
                }
            })
        })
    })
})


// Update a record / beer
app.put('/update', (req, res) => {

    pool.getConnection((err, connection) => {
        if(err) throw err
        console.log(`connected as id ${connection.threadId}`)

        const { id, name, tagline, description, image } = req.body
            // Using id to update  name = ?, tagline = ?, description = ?, image =  / ID constant
        connection.query('UPDATE beers SET name = ?, tagline = ?, description = ?, image = ? WHERE id = ?', [name, tagline, description, image, id] , (err, rows) => {
            connection.release() // return the connection to pool

            if(!err) {
                res.send(`Beer with the ID: ${id} has been updated.`)
            } else {
                console.log(err)
            }

        })

        console.log(req.body)
    })
})



// Listen on enviroment port or 5000
app.listen(port, () => console.log(`Listen on port ${port}`))