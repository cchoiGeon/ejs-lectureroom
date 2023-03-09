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
            return res.write(`<html><head><meta http-equiv="Content-Type" content="text/html; charset=utf-8"></head><script>alert('신고가 완료 되셨습니다'); window.location='/'</script></html>`);
          });
        }else if(!status[0].now_userid && status[0].past_userid){
          db.query('INSERT INTO report(building,floornum,content,time,report_userid,be_reported_userid) VALUES(?,?,?,NOW(),?,?)',[campuslist[i],selectroom,reportcontent,req.session.user_id,status[0].past_userid],
          function(err,report){
            return res.write(`<html><head><meta http-equiv="Content-Type" content="text/html; charset=utf-8"></head><script>alert('신고가 완료 되셨습니다'); window.location='/'</script></html>`);
          }); 
        }else{
          return res.write(`<html><head><meta http-equiv="Content-Type" content="text/html; charset=utf-8"></head><script>alert('잘못 입력하셨습니다'); window.location='/report_${campuslist[i]}'</script></html>`);
        }
      });
    }
    else if(parseInt(selectroom)===301 || parseInt(selectroom)===302 || parseInt(selectroom)===303 || parseInt(selectroom)===304 || parseInt(selectroom)===305 || parseInt(selectroom)===306){
      db.query(`SELECT * FROM ${campuslist[i]}floor3 WHERE number=?`,[parseInt(selectroom)],function(err,status){
        if(status[0].now_userid){
          db.query('INSERT INTO report(building,floornum,content,time,report_userid,be_reported_userid) VALUES(?,?,?,NOW(),?,?)',[campuslist[i],selectroom,reportcontent,req.session.user_id,status[0].now_userid],
          function(err,report){
            return res.write(`<html><head><meta http-equiv="Content-Type" content="text/html; charset=utf-8"></head><script>alert('신고가 완료 되셨습니다'); window.location='/'</script></html>`);
          });
        }else if(!status[0].now_userid && status[0].past_userid){
          db.query('INSERT INTO report(building,floornum,content,time,report_userid,be_reported_userid) VALUES(?,?,?,NOW(),?,?)',[campuslist[i],selectroom,reportcontent,req.session.user_id,status[0].past_userid],
          function(err,report){
            return res.write(`<html><head><meta http-equiv="Content-Type" content="text/html; charset=utf-8"></head><script>alert('신고가 완료 되셨습니다'); window.location='/'</script></html>`);
          }); 
        }else{
          return res.write(`<html><head><meta http-equiv="Content-Type" content="text/html; charset=utf-8"></head><script>alert('잘못 입력하셨습니다'); window.location='/report_${campuslist[i]}'</script></html>`);
        }
      });
    }
    else if(parseInt(selectroom)===401 || parseInt(selectroom)===402 || parseInt(selectroom)===403 || parseInt(selectroom)===404 || parseInt(selectroom)===405 || parseInt(selectroom)===406){
      db.query(`SELECT * FROM ${campuslist[i]}floor4 WHERE number=?`,[parseInt(selectroom)],function(err,status){
        if(status[0].now_userid){
          db.query('INSERT INTO report(building,floornum,content,time,report_userid,be_reported_userid) VALUES(?,?,?,NOW(),?,?)',[campuslist[i],selectroom,reportcontent,req.session.user_id,status[0].now_userid],
          function(err,report){
            return res.write(`<html><head><meta http-equiv="Content-Type" content="text/html; charset=utf-8"></head><script>alert('신고가 완료 되셨습니다'); window.location='/'</script></html>`);
          });
        }else if(!status[0].now_userid && status[0].past_userid){
          db.query('INSERT INTO report(building,floornum,content,time,report_userid,be_reported_userid) VALUES(?,?,?,NOW(),?,?)',[campuslist[i],selectroom,reportcontent,req.session.user_id,status[0].past_userid],
          function(err,report){
            return res.write(`<html><head><meta http-equiv="Content-Type" content="text/html; charset=utf-8"></head><script>alert('신고가 완료 되셨습니다'); window.location='/'</script></html>`);
          }); 
        }else{
          return res.write(`<html><head><meta http-equiv="Content-Type" content="text/html; charset=utf-8"></head><script>alert('잘못 입력하셨습니다'); window.location='/report_${campuslist[i]}'</script></html>`);
        }
      });
    }
    else if(parseInt(selectroom)===501 || parseInt(selectroom)===502 || parseInt(selectroom)===503 || parseInt(selectroom)===504 || parseInt(selectroom)===505 || parseInt(selectroom)===506){
      db.query(`SELECT * FROM ${campuslist[i]}floor5 WHERE number=?`,[parseInt(selectroom)],function(err,status){
        if(status[0].now_userid){
          db.query('INSERT INTO report(building,floornum,content,time,report_userid,be_reported_userid) VALUES(?,?,?,NOW(),?,?)',[campuslist[i],selectroom,reportcontent,req.session.user_id,status[0].now_userid],
          function(err,report){
            return res.write(`<html><head><meta http-equiv="Content-Type" content="text/html; charset=utf-8"></head><script>alert('신고가 완료 되셨습니다'); window.location='/'</script></html>`);
          });
        }else if(!status[0].now_userid && status[0].past_userid){
          db.query('INSERT INTO report(building,floornum,content,time,report_userid,be_reported_userid) VALUES(?,?,?,NOW(),?,?)',[campuslist[i],selectroom,reportcontent,req.session.user_id,status[0].past_userid],
          function(err,report){
            return res.write(`<html><head><meta http-equiv="Content-Type" content="text/html; charset=utf-8"></head><script>alert('신고가 완료 되셨습니다'); window.location='/'</script></html>`);
          }); 
        }else{
          return res.write(`<html><head><meta http-equiv="Content-Type" content="text/html; charset=utf-8"></head><script>alert('잘못 입력하셨습니다'); window.location='/report_${campuslist[i]}'</script></html>`);
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
      return false;
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

server.get("/adminbro",(req,res)=>{
  if(req.session.user_id === 0){
    return res.render("adminbro")
  }
  res.redirect('/')
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
  if(req.session.user_id === 0){
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
    return false;
  }
  res.redirect('/')
})
server.post("/adminbro_report_warning/process",(req,res)=>{
  let post = req.body;
  let reported_id = parseInt(post.reported_id)
  console.log('경고 줄 아이디 : ',reported_id)
  //register에 경고 열을 추가시켜서 3회 경고시 ~ 로 처리하게 끔 한다
})
server.get("/adminbro_user",(req,res)=>{
  if(req.session.user_id === 0){
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
          <td><button type="submit" name="allow" value="${register[i].id}">확인</button></td>
        </tr>`
      }
      table+=``
      return res.render('adminbro_user',{'table':table})
    })
    return false;
  }
  res.redirect('/')
})
server.post("/adminbro_user/process",(req,res)=>{
  let post = req.body;
  if(post.allow){
    db.query('UPDATE register SET allow_login=? WHERE id=?',['true',post.allow],function(err,result){
      return res.redirect('/adminbro_user')
    })
  }
})
server.get("/adminbro_img/:id",(req,res)=>{
  if(req.session.user_id === 0){
    let user_id = parseInt(path.parse(req.params.id).base);
    db.query('SELECT * FROM register WHERE id=?',[user_id],function(err,result){
      let imgroot = result[0].student_card_root
      return res.render('adminbro_user_img',{'imgroot':imgroot})
    })
    return false;
  }
  res.redirect('/')
})
server.listen(3000);