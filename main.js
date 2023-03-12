const express = require('express');
const ejs = require('ejs');
const mysql = require('mysql');
const session = require('express-session');
const FileStore = require('session-file-store')(session);
const bodyParser = require('body-parser');
const server = express();
const multer = require("multer");
const path = require("path");
const Router_select_campus = require('./Router/select_campus');
const Router_report_campus = require('./Router/report_campus');
const Router_adminbro = require('./Router/adminbro')
const f = require('session-file-store');
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
const campuslist = ['A','B','C','D','E','Sanyung']
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
server.use('/select',Router_select_campus);
server.use('/report',Router_report_campus);
server.use('/adminbro',Router_adminbro);


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
            return res.write(`<html><head><meta http-equiv="Content-Type" content="text/html; charset=utf-8"></head><script>alert('Hi ${result[i].name}'); window.location='/'</script></html>`);
          });
          return false;
        }else{
          return res.write(`<html><head><meta http-equiv="Content-Type" content="text/html; charset=utf-8"></head><script>alert('학생증 확인이 완료 될 때까지 기다려주세요'); window.location='/login'</script></html>`);
        }
      }
    }
    return res.write(`<html><head><meta http-equiv="Content-Type" content="text/html; charset=utf-8"></head><script>alert('아이디나 비밀번호를 다시 확인해주세요'); window.location='/login'</script></html>`);
  });
})

server.get("/register",(req,res)=>{
  res.render('register')
})
server.post("/register/process",(req,res)=>{
  let post = req.body;
  db.query('SELECT * FROM register',function(err,register){
    for(var i = 0; i < register.length; i++){
      if(register[i].id === parseInt(post.id)){
        return res.write(`<html><head><meta http-equiv="Content-Type" content="text/html; charset=utf-8"></head><script>alert('사용 중인 아이디입니다'); window.location='/register'</script></html>`)
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
      return res.write(`<html><head><meta http-equiv="Content-Type" content="text/html; charset=utf-8"></head><script>alert('아이디와 비밀번호를 다시 한 번 확인해주세요'); window.location='/register'</script></html>`)
    }
  });
})

server.get("/register2",(req,res)=>{
  res.render('register2')
})
server.post('/register2/process',upload.single('card'),(req,res)=>{
  if(!req.file){
    return res.write(`<html><head><meta http-equiv="Content-Type" content="text/html; charset=utf-8"></head><script>alert('학생증 사진을 올려주세요'); window.location='/register2'</script></html>`)
  }
  db.query('UPDATE register SET student_card_root=? WHERE id=?',[req.file.filename,req.session.registerId],function(err,result){
    console.log(req.file.filename,req.session.registerId)
    return res.redirect('/login');
  })
});
server.get("/logout_process",(req,res)=>{
  req.session.destroy(function(err){
    res.write(`<html><head><meta http-equiv="Content-Type" content="text/html; charset=utf-8"></head><script>alert('로그아웃이 완료됐습니다.'); window.location='/'</script></html>`)
  })
});

server.listen(3000);