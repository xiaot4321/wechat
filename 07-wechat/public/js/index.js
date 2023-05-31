var socket = io('http://localhost:3000')
var username,avatar
//登录功能

$('#login_avatar li').on('click', function() {
    $(this)
      .addClass('now')
      .siblings()
      .removeClass('now')
})

$('#loginBtn').on('click',function(){
    var username = $('#username').val().trim()//去空格
    var password = $('#password').val()
    if(!username)
    {
        alert("请输入用户名")
        return
    }
    var avatar = $('#login_avatar li.now img').attr('src')
    console.log(username , avatar,password)

    socket.emit('login',{
        username: username,
        avatar: avatar,
        password:password
    })
})

$('#registerBtn').on('click',()=>{
  var username = $('#username').val().trim()
  var password = $('#password').val()
  socket.emit('register',{
    username:username,
    avatar:avatar,
    password:password
  })
})

socket.on('registerSuccess',data => {
  alert('注册成功')
})
socket.on('registerFail',data=>{
  alert('注册失败，该用户名已被注册')
})
socket.on('none',data => {
  alert('该用户未注册，请点击注册即可')
})
socket.on('loginError',data => {
    alert('登录失败，该用户已登录')
})
socket.on('loginFail',data => {
  alert('登录失败，密码错误') 
})
socket.on('loginSuccess',data => {
    // alert('登录成功')
    $('.login_box').fadeOut()//淡出
    $('.container').fadeIn()//淡入
    //设置个人信息
    $('.avatar_url').attr('src',data.avatar)
    $('.user-list .username').text(data.username)
    username = data.username
    avatar = data.avatar
    console.log(avatar)
})

socket.on('addUser', data => {
    $('.box-bd').append(
        `<div class = "system">
           <p class = "message_system">
            <span class="content">${data.username}加入了群聊</span>
            </p>
        </div> 
        `
    )
    $('.box-bd').children(':last').get(0).scrollIntoView(false)
})

socket.on('userList',data => {
    $('.user-list ul').html('')
    data.forEach(item => {
        $('.user-list ul').append(`
            <li class = "user">
                <div class = "avatar"><img src = "${item.avatar}" alt = ""/></div>
                <div class = "name">${item.username}</div>
        `)
    });
    $('#userCount').text(data.length)
})

socket.on('delUser', data => {
    $('.box-bd').append(
        `<div class = "system">
           <p class = "message_system">
            <span class="content">${data.username}离开了群聊</span>
            </p>
        </div> 
        `
    )
    $('.box-bd').children(':last').get(0).scrollIntoView(false)
})

$('.closed').on('click',data => {
  socket.emit('logout'); 
  
})

$('.btn-send').on('click',() => {
    //获取到聊天的内容
    var  content = $('#content').html()
    $('#content').html('')
    if(!content) return alert('发送内容不可为空')
    socket.emit('sendMessage',{
        content: content,
        username: username,
        avatar: avatar,
        type:'html'
    })
})

socket.on('receiveMessage', data => {
    // 把接收到的消息显示到聊天窗口中
    if (data.username === username) {
      // 自己的消息
      console.log(data.avatar)
      $('.box-bd').append(`
        <div class="message-box">
          <div class="my message">
            <img class="avatar" src="${data.avatar}" alt="" />
            <div class="content">
              <div class="bubble">
                <div class="bubble_cont">${data.content}</div>
              </div>
            </div>
          </div>
        </div>
      `)
    } else {
      // 别人的消息
      $('.box-bd').append(`
        <div class="message-box">
          <div class="other message">
            <img class="avatar" src="${data.avatar}" alt="" />
            <div class="content">
              <div class="nickname">${data.username}</div>
              <div class="bubble">
                <div class="bubble_cont">${data.content}</div>
              </div>
            </div>
          </div>
        </div>
      `)
    }
    scrollIntoView()
  })
  function scrollIntoView()
  {
    $('.box-bd').children(':last').get(0).scrollIntoView(false)
  }

$('#file').on('change',function(){
    var file = this.files[0]
    var fr = new FileReader()
    fr.readAsDataURL(file)
    fr.onload = function(){
        socket.emit('sendImage', {
            username: username,
            avatar: avatar,
            img: fr.result,
            type:'image'
        })
    }
})

socket.on('receiveImage',data => {
    if (data.username === username) {
        // 自己的消息
        console.log(data.avatar)
        $('.box-bd').append(`
          <div class="message-box">
            <div class="my message">
              <img class="avatar" src="${data.avatar}" alt="" />
              <div class="content">
                <div class="bubble">
                  <div class="bubble_cont">
                    <img src = "${data.content}"
                  </div>
                </div>
              </div>
            </div>
          </div>
        `)
      } else {
        // 别人的消息
        $('.box-bd').append(`
          <div class="message-box">
            <div class="other message">
              <img class="avatar" src="${data.avatar}" alt="" />
              <div class="content">
                <div class="nickname">${data.username}</div>
                <div class="bubble">
                  <div class="bubble_cont">
                  <img src = "${data.content}"
                  </div>
                </div>
              </div>
            </div>
          </div>
        `)
      }
      $('.box-bd img:last').on('load',function(){
        scrollIntoView()
      })
    })

$('.face').on('click',function(){
    $('#content').emoji({
        button: '.face',
        showTab: true,
        animation: 'slide',
        position: 'topRight',
        icons: [
            {
                name: 'QQ表情',
                path: '../lib/jquery-emoji/img/qq/',
                maxNum: 91,
                excludeNums:[41, 45 ,54],
                file: '.gif'
            }
        ]
    })
})
// 变化壁纸功能
const doc = document

const body = doc.querySelector('body')

const mclickMenuList = doc.querySelector('.mclick-menu-list')

const mclickMenuItemList = doc.querySelector('.mclick-menu-list li')

var bgimg = []
bgimg[0] = '../bg/bg1.jpg';
bgimg[1] = '../bg/bg2.jpg'
bgimg[2] = '../bg/bg3.jpg'
bgimg[3] = '../bg/bg4.jpg'
bgimg[4] = '../bg/bg5.jpg'
bgimg[5] = '../bg/bg6.jpg'
bgimg[6] = '../bg/bg7.jpg'
bgimg[7] = '../bg/bg8.jpg'
bgimg[8] = '../bg/bg9.jpg'
var idx = 0
body.addEventListener('contextmenu',(e) => {
  e.preventDefault();
  const{x,y} = e;
  mclickMenuList.setAttribute('style',`--width: ${mclickMenuList.scrollWidth},--height:${mclickMenuList.scrollHeight}`);

  mclickMenuList.style.top = y + 'px';
  mclickMenuList.style.left = x + 'px';
  
  mclickMenuList.classList.add('menu-show');
  mclickMenuItemList.classList.add('menu-item-show')
});

body.addEventListener('click', e => {
  mclickMenuList.classList.remove('menu-show');
  mclickMenuItemList.classList.remove('menu-item-show');
});

$('.chageBg').on('click',function(){
  idx = idx + 1
  idx %= 9
  console.log(bgimg[idx])
  var choseBgImg = bgimg[idx]
  body.style.background = `url("${choseBgImg}") no-repeat center center`
  setTimeout(() => {
    body.style.opacity = '1';
    body.style.backgroundColor = '#000';
  }, 50);
})