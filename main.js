const express = require('express');
const ejs = require('ejs');
const mysql = require('mysql');
const session = require('express-session');
const FileStore = require('session-file-store')(session);
const bodyParser = require('body-parser');
const server = express();
const multer = require("multer");
const path = require("path");
const Router_select_campus = require('./Router/select_campus')
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
for(let i=0; i<campuslist.length; i++){
  server.get(`/report_${campuslist[i]}`,(req,res)=>{
    if(campuslist[i]==='Sanyung'){
      return res.render('reportwriteSanyung',{'login':login,'campuslist':campuslist[i]})
    }
    return res.render('reportwrite',{'login':login,'campuslist':campuslist[i]})
  })
}
for(let i=0; i<campuslist.length; i++){
  server.post(`/report_${campuslist[i]}/process`,(req,res)=>{
    let post = req.body;
    let reportcontent = post.reportcontent;
    let selectroom = post.selectroom;
    if(parseInt(selectroom)===201 || parseInt(selectroom)===202 || parseInt(selectroom)===203 || parseInt(selectroom)===204 || parseInt(selectroom)===205 || parseInt(selectroom)===206 ){
      db.query(`SELECT * FROM ${campuslist[i]}floor2 WHERE number=?`,[parseInt(selectroom)],function(err,status){
        if(status[0].now_userid){
          db.query('INSERT INTO report(building,floornum,content,time,report_userid,be_reported_userid) VALUES(?,?,?,NOW(),?,?)',[campuslist[i],selectroom,reportcontent,req.session.user_id,status[0].now_userid],
          function(err,report){
            res.write(`<script>alert('SUCCESS!')</script>`);
            return res.write("<script>window.location='/'</script>");
          });
        }else if(!status[0].now_userid && status[0].past_userid){
          db.query('INSERT INTO report(building,floornum,content,time,report_userid,be_reported_userid) VALUES(?,?,?,NOW(),?,?)',[campuslist[i],selectroom,reportcontent,req.session.user_id,status[0].past_userid],
          function(err,report){
            res.write("<script>alert('SUCCESS!')</script>");
            return res.write("<script>window.location='/'</script>");
          }); 
        }else{
          res.write("<script>alert('Check again!')</script>");
          return res.write("<script>window.location='/'</script>");
        }
      });
    }
    else if(parseInt(selectroom)===301 || parseInt(selectroom)===302 || parseInt(selectroom)===303 || parseInt(selectroom)===304 || parseInt(selectroom)===305 || parseInt(selectroom)===306){
      db.query(`SELECT * FROM ${campuslist[i]}floor3 WHERE number=?`,[parseInt(selectroom)],function(err,status){
        if(status[0].now_userid){
          db.query('INSERT INTO report(building,floornum,content,time,report_userid,be_reported_userid) VALUES(?,?,?,NOW(),?,?)',[campuslist[i],selectroom,reportcontent,req.session.user_id,status[0].now_userid],
          function(err,report){
            res.write(`<script>alert('SUCCESS!')</script>`);
            return res.write("<script>window.location='/'</script>");
          });
        }else if(!status[0].now_userid && status[0].past_userid){
          db.query('INSERT INTO report(building,floornum,content,time,report_userid,be_reported_userid) VALUES(?,?,?,NOW(),?,?)',[campuslist[i],selectroom,reportcontent,req.session.user_id,status[0].past_userid],
          function(err,report){
            res.write("<script>alert('SUCCESS!')</script>");
            return res.write("<script>window.location='/'</script>");
          }); 
        }else{
          res.write("<script>alert('ERROR!')</script>");
          return res.write("<script>window.location='/'</script>");
        }
      });
    }
    else if(parseInt(selectroom)===401 || parseInt(selectroom)===402 || parseInt(selectroom)===403 || parseInt(selectroom)===404 || parseInt(selectroom)===405 || parseInt(selectroom)===406){
      db.query(`SELECT * FROM ${campuslist[i]}floor4 WHERE number=?`,[parseInt(selectroom)],function(err,status){
        if(status[0].now_userid){
          db.query('INSERT INTO report(building,floornum,content,time,report_userid,be_reported_userid) VALUES(?,?,?,NOW(),?,?)',[campuslist[i],selectroom,reportcontent,req.session.user_id,status[0].now_userid],
          function(err,report){
            res.write(`<script>alert('SUCCESS!')</script>`);
            return res.write("<script>window.location='/'</script>");
          });
        }else if(!status[0].now_userid && status[0].past_userid){
          db.query('INSERT INTO report(building,floornum,content,time,report_userid,be_reported_userid) VALUES(?,?,?,NOW(),?,?)',[campuslist[i],selectroom,reportcontent,req.session.user_id,status[0].past_userid],
          function(err,report){
            res.write("<script>alert('SUCCESS!')</script>");
            return res.write("<script>window.location='/'</script>");
          }); 
        }else{
          res.write("<script>alert('ERROR!')</script>");
          return res.write("<script>window.location='/'</script>");
        }
      });
    }
    else if(parseInt(selectroom)===501 || parseInt(selectroom)===502 || parseInt(selectroom)===503 || parseInt(selectroom)===504 || parseInt(selectroom)===505 || parseInt(selectroom)===506){
      db.query(`SELECT * FROM ${campuslist[i]}floor5 WHERE number=?`,[parseInt(selectroom)],function(err,status){
        if(status[0].now_userid){
          db.query('INSERT INTO report(building,floornum,content,time,report_userid,be_reported_userid) VALUES(?,?,?,NOW(),?,?)',[campuslist[i],selectroom,reportcontent,req.session.user_id,status[0].now_userid],
          function(err,report){
            res.write(`<script>alert('SUCCESS!')</script>`);
            return res.write("<script>window.location='/'</script>");
          });
        }else if(!status[0].now_userid && status[0].past_userid){
          db.query('INSERT INTO report(building,floornum,content,time,report_userid,be_reported_userid) VALUES(?,?,?,NOW(),?,?)',[campuslist[i],selectroom,reportcontent,req.session.user_id,status[0].past_userid],
          function(err,report){
            res.write("<script>alert('SUCCESS!')</script>");
            return res.write("<script>window.location='/'</script>");
          }); 
        }else{
          res.write("<script>alert('ERROR!')</script>");
          return res.write("<script>window.location='/'</script>");
        }
      });
    }
  });
}
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
            res.write(`<script>alert('Hi ${result[i].name}')</script>`);
            return res.write("<script>window.location='/'</script>");
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
server.post('/register2/process',upload.single('card'),(req,res)=>{
  if(!req.file){
    console.log('다시 해주세용')
    return res.redirect('/register2')
  }
  db.query('UPDATE register SET student_card_root=? WHERE id=?',[req.file.filename,req.session.registerId],function(err,result){
    console.log(req.file.filename,req.session.registerId)
    return res.redirect('/login');
  })
});
server.get("/logout_process",(req,res)=>{
  req.session.destroy(function(err){
    res.redirect('/');
  })
});

server.get("/adminbro",(req,res)=>{
  res.render("adminbro")
})
server.post("/adminbro/process",(req,res)=>{
  let post = req.body;
  if(post.report){
    return res.redirect('/adminbro_report')
  }else{
    return res.redirect('/adminbro_user')
  }
})
server.get("/adminbro_report",(req,res)=>{
  db.query('SELECT * FROM report',function(err,report){
    let table= `<table>
    <tr>
      <td>건물 이름</td>
      <td>층</td>
      <td>신고 내용</td>
      <td>시간</td>
      <td>신고한 유저 아이디</td>
      <td>신고 당한 유저 아이디</td>
    </tr>`
    for(let i=0; i<report.length; i++){
      table += `
      <tr>
        <td>${report[i].building}</td>
        <td>${report[i].floornum}</td>
        <td>${report[i].content}</td>
        <td>${report[i].time}</td>
        <td>${report[i].report_userid}</td>
        <td>${report[i].be_reported_userid}</td>
      </tr>`
    }
    table+= `</table>`
    return res.render('adminbro_report',{'table':table})
  })
})
server.get("/adminbro_user",(req,res)=>{
  db.query('SELECT * FROM register',function(err,register){
    let table=`<table>
    <tr>
      <td>회원 이름</td>
      <td>회원 아이디</td>
      <td>강의실 사용 여부</td>
      <td>학생증</td>
      <td>학생증 확인 여부</td>
      <td>허락 여부</td>
    </tr>`
    for(let i=0; i<register.length; i++){
      table+=`
      <tr>
        <td>${register[i].name}</td>
        <td>${register[i].id}</td>
        <td>${register[i].usetrue}</td>
        <td><a href="/adminbro_img/${register[i].id}">학생증 보러 가기</a></td>
        <td>${register[i].allow_login}</td>
        <td><button type="submit" name="allow" value="true">확인</button></td>
      </tr>`
    }
    table+=``
    return res.render('adminbro_report',{'table':table})
  })
})
server.get("/adminbro_img/:id",(req,res)=>{
  let user_id = parseInt(path.parse(req.params.id).base);
  db.query('SELECT * FROM register WHERE id=?',[user_id],function(err,result){
    let imgroot = result[0].student_card_root
    return res.render('adminbro_user_img',{'imgroot':imgroot})
  })
})
server.listen(3000);