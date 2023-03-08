const express = require('express');
const ejs = require('ejs');
const mysql = require('mysql');
const session = require('express-session');
const FileStore = require('session-file-store')(session);
const bodyParser = require('body-parser');
const server = express();
const multer = require("multer");
const path = require("path");
const Router = require('./Router/router')
const db = mysql.createConnection({
  host : 'localhost',
  user : 'root',
  password : '11111111',
  database : 'lectureroom'
});
db.connect();
//MULTER 사용
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null,'./uploads') // cb 콜백함수를 통해 전송된 파일 저장 디렉토리 설정
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null,path.basename(file.originalname,ext) + "-" + Date.now() + ext); // cb 콜백함수를 통해 전송된 파일 이름 설정
  },
})
const upload = multer({storage: storage})

let login;

//set 메서드
server.set('view engine', 'ejs');
server.set('html',require('ejs').renderFile);
server.set('views', './views');

//use 메서드
server.use(express.static('therest'));
server.use(express.static('uploads'));
server.use(bodyParser.urlencoded({ extended: false}));
server.use(session({
  secret: 'q1321weff@45%$',
  resave: false,
  saveUninitialized: true,
  store: new FileStore()
}))
server.use('/select',Router);

function loginbox(req,res){
  if(req.session.login){
    login = `<li><a class="dropdown-item" href="/logout_process">로그아웃</a></li>`;
  }else{
    login = `<li><a class="dropdown-item" href="/login">로그인</a></li>
      <li><a class="dropdown-item" href="/register">회원가입</a></li>`;
  }
}

server.get("/",(req,res)=>{
  loginbox(req,res)
  res.render('index',{'login':login})
})

server.get("/report",(req,res)=>{
  loginbox(req,res)
  if(!req.session.login){
    return res.redirect('/login')
  }
  res.render('report',{'login':login})
})

// post 필요 없음
server.get("/how_use",(req,res)=>{
  loginbox(req,res)
  res.render('how_use',{'login':login})
})
server.get("/map",(req,res)=>{
  loginbox(req,res)
  res.render('map',{'login':login})
})
//
server.get("/login",(req,res)=>{
  res.render('login')
})
server.post("/login/process",(req,res)=>{
  let post = req.body;
  db.query('SELECT * FROM register',function(err,result){
    if(err){
      res.redirect('/login');
      return false;
    }
    for(let i = 0; i < result.length; i++){
      if(result[i].id === parseInt(post.id) && result[i].password === post.password){
        if(result[i].allow_login){
          req.session.user_id = result[i].id;
          req.session.user_password = result[i].password;
          req.session.user_name = result[i].name;
          req.session.login = true;
          req.session.registerId = null;
          req.session.save(function(){
          res.redirect('/');
          });
          return false;
        }else{
          res.write("<script>alert('Sorry please wait reviewing your student card.')</script>");
          return res.write("<script>window.location='/login'</script>");
        }
      }
    }
    res.redirect('/login');
    return false;
  });
})

server.get("/register",(req,res)=>{
  res.render('register')
})
server.post("/register/process",(req,res)=>{
  let post = req.body;
  db.query('SELECT * FROM register',function(err,register){
    for(var i = 0; i < register.length; i++){
      if(register[i].id === post.id){
        console.log('사용 중인 아이디입니다')
        return res.redirect('/register');
      }
    }
    if(9<post.id.length<=10 && post.password.length > 10){
      db.query('INSERT INTO register(name,id,password,usetrue) VALUES(?,?,?,?)',[post.name,post.id,post.password,'사용가능'],function(err,result){
        req.session.registerId = post.id;
        req.session.save(function(){
          return res.redirect('/register2');
        });
      });
    }else{
      console.log('다시 입력해주세요')
      return res.redirect('/register');
    }
  });
})

server.get("/register2",(req,res)=>{
  res.render('register2')
})
server.post('/register2/process',upload.single('card'),(req,res) => {
  if(!req.file){
    console.log('다시 해주세용')
    return res.redirect('/register2')
  }
  db.query('UPDATE register SET student_card_root=? WHERE id=?',[req.file.filename,req.session.registerId],function(err,result){
    console.log(req.file.filename,req.session.registerId)
    return res.redirect('/login');
  })
});
server.get("/logout_process",(req,res) => {
  req.session.destroy(function(err){
    res.redirect('/');
  })
});

server.listen(3000);