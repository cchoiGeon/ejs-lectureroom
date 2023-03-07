const express = require('express');
const ejs = require('ejs');
const mysql = require('mysql');
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

const campuslist = ['A','B','C','D','E','Sanyung']

router.use(bodyParser.urlencoded({ extended: false}));
router.use(session({
  secret: 'q1321weff@45%$',
  resave: false,
  saveUninitialized: true,
  store: new FileStore()
}))
router.use(express.static('therest'));
router.use(express.static('uploads'));

for(let i=0; i<campuslist.length; i++){
  router.get(`/${campuslist[i]}`,(req,res)=>{
    db.query(`SELECT * FROM ${campuslist[i]}floor2`,function(err,floor2){
      if(err){
        console.log(err)
      }
      db.query(`SELECT * FROM ${campuslist[i]}floor3`,function(err,floor3){
        db.query(`SELECT * FROM ${campuslist[i]}floor4`,function(err,floor4){
          let true201 = 0;
          let true202 = 0;
          let true203 = 0;
          if(floor2[0].status === '사용가능'){
            true201 = 1;
          }if(floor2[1].status === '사용가능'){
            true202 = 1;
          }if(floor2[2].status === '사용가능'){
            true203 = 1;
          }
          let true301 = 0;
          let true302 = 0;
          let true303 = 0;
          if(floor3[0].status === '사용가능'){
            true301 = 1;
          }if(floor3[1].status === '사용가능'){
            true302 = 1;
          }if(floor3[2].status === '사용가능'){
            true303 = 1;
          }
          let true401 = 0;
          let true402 = 0;
          let true403 = 0;
          if(floor4[0].status === '사용가능'){
            true401 = 1;
          }if(floor4[1].status === '사용가능'){
            true402 = 1;
          }if(floor4[2].status === '사용가능'){
            true403 = 1;
          }
          room2sum = true201+true202+true203;
          room3sum = true301+true302+true303;
          room4sum = true401+true402+true403;
          res.render('search',{'campuslist':campuslist[i],'floor2':room2sum,'floor3':room3sum,'floor4':room4sum})
        });
      });
    });
  })
}

for(let i=0; i<campuslist.length; i++){
 router.post(`/${campuslist[i]}/process`,(req,res)=>{
    let post = req.body;
    if(post.floor2){
      return res.redirect(`/select/${campuslist[i]}_floor2`)
    }else if(post.floor3){
      return res.redirect(`/select/${campuslist[i]}_floor3`)
    }else if(post.floor4){
      return res.redirect(`/select/${campuslist[i]}_floor4`)
    }
  })
}

for(let i=0; i<campuslist.length; i++){
 router.get(`/${campuslist[i]}_floor2`,(req,res)=>{
    db.query(`SELECT * FROM ${campuslist[i]}floor2`,function(err,floor2){
      if(err){
        console.log(err)
      }
      let f201 = floor2[0].number
      let f202 = floor2[1].number
      let f203 = floor2[2].number
      let fs201 = floor2[0].status;
      let fs202 = floor2[1].status;
      let fs203 = floor2[2].status;
      res.render('searchfloor',{'campuslist':campuslist[i],'selectfloor':'floor2','selectfloor2':f201,'selectfloor3':f202,'selectfloor4':f203,'floor_status1':fs201,'floor_status2':fs202,'floor_status3':fs203})
    })
  })
}

for(let i=0; i<campuslist.length; i++){
  router.post(`/${campuslist[i]}_floor2/process`,(req,res)=>{
    let post = req.body;
    let select201 = post.class201
    let select202 = post.class202
    let select203 = post.class203
    let list = [select201,select202,select203]
    db.query('SELECT * FROM register WHERE id=?',[req.session.user_id],function(err,register){
      db.query(`SELECT * FROM ${campuslist[i]}floor2`,function(err2,floor2){
        for(let k=0; k<list.length; k++){
          if(list[k] === '입실'){
            if(floor2[k].status === '사용가능'){
              if(register[0].id === req.session.user_id && register[0].usetrue === '사용가능'){
                db.query(`UPDATE ${campuslist[i]}floor2 SET status=?, time=NOW(), now_userid=? WHERE number=?`,['사용 중',req.session.user_id,parseInt(floor2[k].number)],
                function(err3,result){
                  db.query('UPDATE register SET usetrue=? WHERE id=?',['사용 중',req.session.user_id],
                  function(err4,result2){
                    res.write(`<script>alert('SUCCESS!')</script>`);
                    return res.write(`<script>window.location='/select/${campuslist[i]}'</script>`);
                  });
                });
              }else if(register[0].id === req.session.user_id && register[0].usetrue === '사용 중'){
                console.log('사용중인 강의실이 있습니다');
                return res.redirect(`/select/${campuslist[i]}`);
              }
            }else{
              console.log("사용 중인 강의실입니다");
              res.redirect(`/select/${campuslist[i]}`);
              return false;
            }
          }
          else if(list[k] ==='퇴실'){
            if(floor2[k].status === '사용 중'){
              if(floor2[k].now_userid === req.session.user_id && register[0].usetrue === '사용 중'){
                db.query(`UPDATE ${campuslist[i]}floor2 SET status=?, time=NOW(), past_userid=?, now_userid=? WHERE number=?`,
                ['사용가능',req.session.user_id,null,parseInt(floor2[k].number)],
                function(err3,result){
                  console.log("퇴실이 완료되셨습니다");
                  db.query('UPDATE register SET usetrue=? WHERE id=?',
                  ['사용가능',req.session.user_id],function(err4,register2){
                    res.write(`<script>alert('SUCCESS!')</script>`);
                    return res.write(`<script>window.location='/select/${campuslist[i]}'</script>`);
                  });
                })
                return false;
              }else if(floor2[k].now_userid != req.session.user_id){
                console.log('다른 사람이 사용하는 강의실입니다');
                return res.redirect(`/select/${campuslist[i]}`);
              }
            }
            else{
              console.log('빈 강의실이거나 퇴실 완료한 강의실입니다.')
              res.redirect(`/select/${campuslist[i]}`);
              return false;
            }
          }
          else if(list[k] === '예약'){
            if(floor2[k].status === '사용가능'){
              if(register[0].id === req.session.user_id && register[0].usetrue === '사용가능'){
                db.query(`UPDATE ${campuslist[i]}floor2 SET status=?, time=NOW(), now_userid=? WHERE number=?`,
                ['사용 중',req.session.user_id,parseInt(floor2[k].number)],
                function(err3,result){
                  console.log("예약이 완료되셨습니다");
                  db.query('UPDATE register SET usetrue=? WHERE id=?',
                  ['사용 중',req.session.user_id],function(err4,register2){
                    res.write(`<script>alert('SUCCESS!')</script>`);
                    return res.write(`<script>window.location='/select/${campuslist[i]}'</script>`);
                  });
                });
                return false;
              }else if(register[0].id === req.session.user_id && register[0].usetrue === '사용 중'){
                console.log('사용중인 강의실이 있습니다');
                return res.redirect(`/select/${campuslist[i]}`);
              }
            }
            else{
              console.log('사용 중인 강의실입니다.')
              res.redirect(`/select/${campuslist[i]}`);
              return false;
            }
          }
        }
      })
    })
  })
}
for(let i=0; i<campuslist.length; i++){
  router.get(`/${campuslist[i]}_floor3`,(req,res)=>{
    db.query(`SELECT * FROM ${campuslist[i]}floor3`,function(err,floor3){
      if(err){
        console.log(err)
      }
      let f301 = floor3[0].number
      let f302 = floor3[1].number
      let f303 = floor3[2].number
      let fs301 = floor3[0].status;
      let fs302 = floor3[1].status;
      let fs303 = floor3[2].status;
      res.render('searchfloor',{'campuslist':campuslist[i],'selectfloor':'floor3','selectfloor2':f301,'selectfloor3':f302,'selectfloor4':f303,'floor_status1':fs301,'floor_status2':fs302,'floor_status3':fs303})
    })
  })
}
for(let i=0; i<campuslist.length; i++){
  router.post(`/${campuslist[i]}_floor3/process`,(req,res)=>{
    let post = req.body;
    let select301 = post.class301
    let select302 = post.class302
    let select303 = post.class303
    let list = [select301,select302,select303]
    db.query('SELECT * FROM register WHERE id=?',[req.session.user_id],function(err,register){
      db.query(`SELECT * FROM ${campuslist[i]}floor3`,function(err2,floor3){
        for(let k=0; k<list.length; k++){
          if(list[k] === '입실'){
            if(floor3[k].status === '사용가능'){
              if(register[0].id === req.session.user_id && register[0].usetrue === '사용가능'){
                db.query(`UPDATE ${campuslist[i]}floor3 SET status=?, time=NOW(), now_userid=? WHERE number=?`,['사용 중',req.session.user_id,parseInt(floor3[k].number)],
                function(err3,result){
                  db.query('UPDATE register SET usetrue=? WHERE id=?',['사용 중',req.session.user_id],
                  function(err4,result2){
                    res.write(`<script>alert('SUCCESS!')</script>`);
                    return res.write(`<script>window.location='/select/${campuslist[i]}'</script>`);
                  });
                });
              }else if(register[0].id === req.session.user_id && register[0].usetrue === '사용 중'){
                console.log('사용중인 강의실이 있습니다');
                return res.redirect(`/select/${campuslist[i]}`);
              }
            }else{
              console.log("사용 중인 강의실입니다");
              res.redirect(`/select/${campuslist[i]}`);
              return false;
            }
          }
          else if(list[k] ==='퇴실'){
            if(floor3[k].status === '사용 중'){
              if(floor3[k].now_userid === req.session.user_id && register[0].usetrue === '사용 중'){
                db.query(`UPDATE ${campuslist[i]}floor3 SET status=?, time=NOW(), past_userid=?, now_userid=? WHERE number=?`,
                ['사용가능',req.session.user_id,null,parseInt(floor3[k].number)],
                function(err3,result){
                  console.log("퇴실이 완료되셨습니다");
                  db.query('UPDATE register SET usetrue=? WHERE id=?',
                  ['사용가능',req.session.user_id],function(err4,register2){
                    res.write(`<script>alert('SUCCESS!')</script>`);
                    return res.write(`<script>window.location='/select/${campuslist[i]}'</script>`);
                  });
                })
                return false;
              }else if(floor3[k].now_userid != req.session.user_id){
                console.log('다른 사람이 사용하는 강의실입니다');
                return res.redirect(`/select/${campuslist[i]}`);
              }
            }
            else{
              console.log('빈 강의실이거나 퇴실 완료한 강의실입니다.')
              res.redirect(`/select/${campuslist[i]}`);
              return false;
            }
          }
          else if(list[k] === '예약'){
            if(floor3[k].status === '사용가능'){
              if(register[0].id === req.session.user_id && register[0].usetrue === '사용가능'){
                db.query(`UPDATE ${campuslist[i]}floor3 SET status=?, time=NOW(), now_userid=? WHERE number=?`,
                ['사용 중',req.session.user_id,parseInt(floor3[k].number)],
                function(err3,result){
                  console.log("예약이 완료되셨습니다");
                  db.query('UPDATE register SET usetrue=? WHERE id=?',
                  ['사용 중',req.session.user_id],function(err4,register2){
                    res.write(`<script>alert('SUCCESS!')</script>`);
                    return res.write(`<script>window.location='/select/${campuslist[i]}'</script>`);
                  });
                });
                return false;
              }else if(register[0].id === req.session.user_id && register[0].usetrue === '사용 중'){
                console.log('사용중인 강의실이 있습니다');
                return res.redirect(`/select/${campuslist[i]}`);
              }
            }
            else{
              console.log('사용 중인 강의실입니다.')
              res.redirect(`/select/${campuslist[i]}`);
              return false;
            }
          }
        }
      })
    })
  })
}
for(let i=0; i<campuslist.length; i++){
  router.get(`/${campuslist[i]}_floor4`,(req,res)=>{
    db.query(`SELECT * FROM ${campuslist[i]}floor4`,function(err,floor4){
      if(err){
        console.log(err)
      }
      let f401 = floor4[0].number
      let f402 = floor4[1].number
      let f403 = floor4[2].number
      let fs401 = floor4[0].status;
      let fs402 = floor4[1].status;
      let fs403 = floor4[2].status;
      res.render('searchfloor',{'campuslist':campuslist[i],'selectfloor':'floor4','selectfloor2':f401,'selectfloor3':f402,'selectfloor4':f403,'floor_status1':fs401,'floor_status2':fs402,'floor_status3':fs403})
    })
  })
}
module.exports = router;