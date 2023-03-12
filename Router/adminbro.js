const express = require('express');
const ejs = require('ejs');
const mysql = require('mysql');
const path = require('path')
const session = require('express-session');
const FileStore = require('session-file-store')(session);
const bodyParser = require('body-parser');
const router = express.Router();
const db = mysql.createConnection({
  host : 'localhost',
  user : 'root',
  password : '11111111',
  database : 'lectureroom'
});
db.connect();


router.use(bodyParser.urlencoded({ extended: false}));
router.use(session({
  secret: 'q1321weff@45%$',
  resave: false,
  saveUninitialized: true,
  store: new FileStore()
}))
router.use(express.static('therest'));
router.use(express.static('uploads'));

router.get("/",(req,res)=>{
  if(req.session.user_id === 0){
    return res.render("adminbro")
  }
  res.redirect('/')
})
router.post("/process",(req,res)=>{
  let post = req.body;
  if(post.report){
    return res.redirect('/adminbro/report')
  }else{
    return res.redirect('/adminbro/user')
  }
})
router.get("/report",(req,res)=>{
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
router.post("/report/process",(req,res)=>{
  let post = req.body;
  let reported_id = parseInt(post.reported_id)
  console.log('경고 줄 아이디 : ',reported_id)
  //register에 경고 열을 추가시켜서 3회 경고시 ~ 로 처리하게 끔 한다
})
router.get("/user",(req,res)=>{
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
        <td>아이디 삭제</td>
      </tr>`
      for(let i=0; i<register.length; i++){
        table+=`
        <tr>
          <td>${register[i].name}</td>
          <td>${register[i].id}</td>
          <td>${register[i].usetrue}</td>
          <td><a href="/adminbro/img/${register[i].id}">학생증 보러 가기</a></td>
          <td>${register[i].allow_login}</td>
          <td><button type="submit" name="allow" value="${register[i].id}">확인</button></td>
          <td><button type="submit" name="delete" value="${register[i].id}">확인</button></td>
        </tr>`
      }
      table+=``
      return res.render('adminbro_user',{'table':table})
    })
    return false;
  }
  res.redirect('/')
})
router.post("/user/process",(req,res)=>{
  let post = req.body;
  if(post.allow){
    db.query('UPDATE register SET allow_login=? WHERE id=?',['true',post.allow],function(err,result){
      return res.redirect('/adminbro/user')
    })
  }else if(post.delete){
    db.query('DELETE FROM register WHERE id=?',[post.delete],function(err,result){
      return res.redirect('/adminbro/user')
    })
  }
})
router.get("/img/:id",(req,res)=>{
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

module.exports = router