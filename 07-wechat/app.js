//启动服务端
var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);
const url = require('url')
const fs = require('fs')
const db = require('./db/db.js')

var mysql = require('mysql')
const { Console } = require('console')
const { query } = require('express')

var connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'qwe123',
  database: 'websocket'
});

const users = []

server.listen(3000, () => {
  console.log('服务器启动成功了')
  console.log('http://localhost:3000/');
});
//处理为静态资源
app.use(require('express').static('public'))

app.get('/', function (req, res) {
  res.redirect('/index.html')
});

db.selectAll('select count(*) as sum from message', (e, r) => {
  //id 按照消息发送的先后顺序递增
  console.log('数据库共有' + r[0].sum + '条历史消息记录')
  id_now = r[0].sum + 1
})

function initMessage(socket) {
  db.selectAll('select * from message order by id asc', (e, res) => {
    // console.log(r)
    // console.log(r[0])
    for (var i = 0; i < res.length; i++) {
      // console.log(res[i])
      if (res[i].type === 'image') {
        //广播给当前进入聊天室的用户
        socket.emit('receiveImage', res[i])
        console.log('历史消息：')
        console.log(res[i])
      } else {
        //广播给当前进入聊天室的用户
        socket.emit('receiveMessage', res[i])
        console.log('历史消息：')
        console.log(res[i])
      }
    }
  })
}

io.on('connection', function (socket) {
  socket.on('login', data => {
    let user = users.find(item => item.username === data.username)
    if (user) {
      //表示用户存在
      console.log('登录失败')
      socket.emit('loginError', { msg: '登录失败' })
      return
    }
    select_user(data, result => {
      if (result.length) {
        if (result[0].password != data.password) {
          socket.emit('loginFail', '密码错误!');
          return;
        }
        else {
          users.push(data)
          socket.emit('loginSuccess', data)
          console.log('登录成功')

          io.emit('addUser', data)
          io.emit('userList', users)

          socket.username = data.username
          socket.avatar = data.avatar
          initMessage(socket)
        }
      }
      else {
        socket.emit('none', data)
      }
    })
  })
  socket.on('register', data => {
    console.log(data)
    
    select_user(data, result => {
      console.log(result)
      if (result.length) {
        socket.emit('registerFail', data)
      }
      else {
        socket.emit('registerSuccess', data);
        insert_user(data)
        // users.push(data)
      }
    })
    
    // socket.emit('loginSuccess', data)
    // console.log('登录成功')

    io.emit('addUser', data)
    io.emit('userList', users)

    socket.username = data.username
    socket.avatar = data.avatar
  })
  socket.on('disconnect', data => {
    let idx = users.findIndex(item => item.username === socket.username)
    //删除这个人
    users.splice(idx, 1)
    io.emit('delUser', {
      username: socket.username,
      avatar: socket.avatar
    })
    io.emit('userList', users)
  })

  socket.on('sendMessage', data => {
    console.log(data)
    let saveData = {
      id: id_now,
      username: data.username,
      content: data.content,
      avatar: data.avatar,
      type: data.type
    }
    
    db.insertData('message', saveData, (e, r) => {
      console.log('消息存入成功')
      id_now++
    })
    console.log('聊天消息')
    console.log(saveData)
    //广播给所有用户
    io.emit('receiveMessage', saveData)
  })

  socket.on('sendImage', data => {
    let saveData = {
      id: id_now,
      username: data.username,
      avatar: data.avatar,
      content: data.img,
      type: data.type
    }
    db.insertData('message', saveData, (e, r) => {
      console.log('消息存入成功')
      id_now++
    })
    console.log('聊天消息')
    console.log(saveData)
    //广播给所有用户
    io.emit('receiveImage', saveData)
  })


  socket.on('logout', () => {
    let idx = users.findIndex(item => item.username === socket.username)
    //删除这个人
    users.splice(idx, 1)
    io.emit('delUser', {
        username: socket.username,
        avatar: socket.avatar
    })
    io.emit('userList', users)
    socket.emit('logoutSuccess')
  })
});

function select_user(data, callback) {
  let sql = 'SELECT * FROM usersinformation where username = \'' + data.username + '\';'
  connection.query(sql, (err, result) => {
    if (err) {
      console.log('[SELECT ERROR] - ', err.message);
      callback(null)
    }
    callback(result)
  })
}

function insert_user(data) {
  let sql = 'INSERT INTO usersinformation VALUES (\'' + data.username + '\',\'' + data.password + '\');'
  connection.query(sql, (err, result) => {
    if (err) {
      console.log('[INSERT ERROR] - ', err.message);
      return;
    };
  });
  console.log('插入成功')
}