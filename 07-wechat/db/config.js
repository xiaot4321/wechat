const mysql = require('mysql')

const connectdb = () => {
    var  connection = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'qwe123',
        database:'websocket'
    })
    return connection
}

module.exports=connectdb;