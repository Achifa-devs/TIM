const { NeonDB } = require('./db');
const { 
  express,
  parser,
  cors,
  bcrypt,
  shortId,
  jwt,
  morgan
} = require('./modules');
const app = express();  
app.use(morgan('dev'));

require('dotenv').config();   

app.options('*', cors());

app.use(cors({
  origin: '*',
  methods: ['POST', 'PUT', 'GET', 'OPTIONS', 'HEAD', 'DELETE', 'UPDATE'],
  credentials: true,
  optionsSuccessStatus: 200
})); 

const maxAge = 90 * 24 * 60 * 60; 

const createToken = (id) => {
  return jwt.sign({ id }, 'security_secret', {
     expiresIn: maxAge
  });
};

app.listen(process.env.PORT,_ => console.log('app is live @',process.env.PORT));
// io(server, {cors: {origin: '*'}}).on('connection',(socket) => {});
 

app.post("/signup", parser, async(req,res) => {

  let {fname,lname,email,phone,pwd} = req.body;


  async function checkPhone() {
    return(
      await NeonDB.then((pool) => 
          pool.query(`
              SELECT COUNT(*) as count
              FROM security
              WHERE phone = '${phone}'
          `)
          .then(result => parseInt(result.rows[0].count, 10) > 0 ? {err: 'duplicate phone', bool: false} : {bool: true, err: ''})
          .catch(err => (err))
      ) 
    )
  }

  async function checkEmail() {
    return(
      await NeonDB.then((pool) => 
        pool.query(`
            SELECT COUNT(*) as count
            FROM security
            WHERE email = '${email}'
        `)
        .then(result => parseInt(result.rows[0].count, 10) > 0 ? {err: 'duplicate email', bool: false} : {bool: true, err: ''})
        .catch(err => (err))
      )
    )
  } 

  try { 
    
    let email = await checkEmail(data => data)
    let phone = await checkPhone(data => data)
    new Promise((resolve, reject) => {
  
        if(!email.bool){
          reject(email.err)
        }else if(!phone.bool){
          reject(phone.err)
        }else{
            resolve(true)
        }
    })
    .then(async() => {
      let date = new Date();
      let hPwd = await bcrypt.hash(pwd, 10) ;
      let security_id = shortId.generate();
      let token = createToken(security_id)
      
  
      NeonDB.then((pool) => 
        pool.query(`insert into security(id,security_id,fname,lname,email,phone,password,created_at,notification) values(DEFAULT, '${security_id}', '${fname}', '${lname}', '${req.body.email}', '${req.body.phone}', '${hPwd}', '${date}', '${null}')`)
        .then(result => result.rowCount > 0 ? res.send({bool: true, token: token}) : res.send({bool: false}))
        .catch(err => console.log(err))
      )
      .catch(err => {
        res.status(201).send({bool: false, data: err})
        console.log(err)
      })
    })
    .catch(err => {

      console.log(err)
      res.status(201).send({bool: false, data: err})
    })
  } catch (error) {
    console.log(error)
    res.status(201).send({bool: false, data: error})
  }
})

app.post("/security-login", parser, (req,res) => {
  let {email,pwd} = req.body;
 
  new Promise((resolve, reject) => {
      NeonDB
      .then(async(pool) => {
              
        pool.query(`select "id" from "security" where "email" = '${email}'`, (err, result) => {
            
          if(!err){
            if(result.rows.length > 0){
              const id = result.rows[0].id;
              resolve(id)
            }else{
                
              reject({Mssg: "Email is not registered..."});
            }
          }else{
            console.log('error: ',err)
          }
              
        })
          
      });
  })
  .then(async(id) => {
    return(
      NeonDB
      .then(async(pool) => {
        let database_return_value = await pool.query(
            `select "security_id","email","password","fname","lname" from  "security" where "id" = '${id}'`
        )
        .then(result => result.rows[0])
        .catch(err => console.log('error: ',err))

        return database_return_value
      })
    )
      
  })
  .then(async(user) => { 
    if(user){
      console.log(email,pwd)
      const auth = await bcrypt.compare(pwd, user.password);
      if (auth) {
        const token = createToken(user.security_id);
        res.status(200).send({bool: true, id: user.security_id, token: token});

      }else{
        res.status(400).send({
          Mssg: "Invalid password",
          bool: false
        })
      }
    }else{
      res.status(400).send({
        Mssg: "Email is not registered",
        bool: false
      })
    }
  })
  .catch(err => {
    console.log('error: ',err)
    res.status(400).send({
      Mssg: "Email is not registered",
      bool: false
    })

  })
})

app.post("/auth", parser, async(req,res) => {
  let {token} = req.body;
  const { id } = jwt.verify(token, 'security_secret');
  console.log('Decoded ID:', id);
 try {
   NeonDB.then((pool) => 
     pool.query(`SELECT * FROM security WHERE security_id = '${id}'`)
     .then(result => {
       console.log(result)
       res.status(200).send({bool: true, info: result.rows[0]})
     })
     .catch(err => {
       res.status(201).send({bool: false})
       console.log(err)
     })
   ) 
 } catch (error) {
  console.log(error)
 }
})

app.post("/shift", parser, (req,res) => {
  let data = req.body;
  console.log(data)
  res.json({mssg: 'hello world'})
 
})

app.get('/profile', (req,res) => {
  let data = req.query;
  
 
})

app.get('/shift', (req,res) => {
  let {security_id} = req.query;
  console.log(security_id)
  try {
    NeonDB.then((pool) => 
      pool.query(`SELECT * FROM shifts WHERE security_id = '${security_id}'`)
      .then(result => {
       
        res.status(200).send(result.rows)
      })
      .catch(err => {
        res.status(201).send([])
        console.log(err)
      })
    ) 
  } catch (error) {
    res.status(201).send([])
    console.log(error)
  }
 
})

app.get('/inbox', (req,res) => {
  let data = req.query;
  
 
})
















app.post("/admin-registration", parser, async(req,res) => {

  let {fname,lname,email,phone,pwd} = req.body;


  async function checkPhone() {
    return(
      await NeonDB.then((pool) => 
          pool.query(`
              SELECT COUNT(*) as count
              FROM admin
              WHERE phone = '${phone}'
          `)
          .then(result => parseInt(result.rows[0].count, 10) > 0 ? {err: 'duplicate phone', bool: false} : {bool: true, err: ''})
          .catch(err => (err))
      ) 
    )
  }

  async function checkEmail() {
    return(
      await NeonDB.then((pool) => 
        pool.query(`
            SELECT COUNT(*) as count
            FROM admin
            WHERE email = '${email}'
        `)
        .then(result => parseInt(result.rows[0].count, 10) > 0 ? {err: 'duplicate email', bool: false} : {bool: true, err: ''})
        .catch(err => (err))
      )
    )
  } 

  try { 
    
    let email = await checkEmail(data => data)
    let phone = await checkPhone(data => data)
    new Promise((resolve, reject) => {
  
        if(!email.bool){
          reject(email.err)
        }else if(!phone.bool){
          reject(phone.err)
        }else{
            resolve(true)
        }
    })
    .then(async() => {
      let date = new Date();
      let hPwd = await bcrypt.hash(pwd, 10) ;
      let admin_id = shortId.generate();
      let token = createToken(admin_id)
      
  
      NeonDB.then((pool) => 
        pool.query(`insert into admin(id,admin_id,fname,lname,email,phone,password,created_at,notification) values(DEFAULT, '${admin_id}', '${fname}', '${lname}', '${req.body.email}', '${req.body.phone}', '${hPwd}', '${date}', '${null}')`)
        .then(result => result.rowCount > 0 ? res.send({bool: true, token: token}) : res.send({bool: false}))
        .catch(err => console.log(err))
      )
      .catch(err => {
        res.status(201).send({bool: false, data: err})
        console.log(err)
      })
    })
    .catch(err => {

      console.log(err)
      res.status(201).send({bool: false, data: err})
    })
  } catch (error) {
    console.log(error)
    res.status(201).send({bool: false, data: error})
  }
})

app.post("/admin-login", parser, (req,res) => {
  let {email,pwd} = req.body;
 
  new Promise((resolve, reject) => {
      NeonDB
      .then(async(pool) => {
              
        pool.query(`select "id" from "admin" where "email" = '${email}'`, (err, result) => {
            
          if(!err){
            if(result.rows.length > 0){
              const id = result.rows[0].id;
              resolve(id)
            }else{
                
              reject({Mssg: "Email is not registered..."});
            }
          }else{
            console.log('error: ',err)
          }
              
        })
          
      });
  })
  .then(async(id) => {
    return(
      NeonDB
      .then(async(pool) => {
        let database_return_value = await pool.query(
            `select "admin_id","email","password","fname","lname" from  "admin" where "id" = '${id}'`
        )
        .then(result => result.rows[0])
        .catch(err => console.log('error: ',err))

        return database_return_value
      })
    )
      
  })
  .then(async(user) => { 
    if(user){
      console.log(email,pwd)
      const auth = await bcrypt.compare(pwd, user.password);
      if (auth) {
        const token = createToken(user.admin_id);
        res.status(200).send({bool: true, id: user.admin_id, token: token});

      }else{
        res.status(400).send({
          Mssg: "Invalid password",
          bool: false
        })
      }
    }else{
      res.status(400).send({
        Mssg: "Email is not registered",
        bool: false
      })
    }
  })
  .catch(err => {
    console.log('error: ',err)
    res.status(400).send({
      Mssg: "Email is not registered",
      bool: false
    })

  })
})

app.post("/auth", parser, async(req,res) => {
  let {token} = req.body;
  const { id } = jwt.verify(token, 'admin_secret');
  console.log('Decoded ID:', id);
 try {
   NeonDB.then((pool) => 
     pool.query(`SELECT * FROM admin WHERE admin_id = '${id}'`)
     .then(result => {
       console.log(result)
       res.status(200).send({bool: true, info: result.rows[0]})
     })
     .catch(err => {
       res.status(201).send({bool: false})
       console.log(err)
     })
   ) 
 } catch (error) {
  console.log(error)
 }
})


app.get("/admin/shifts", parser, (req,res) => {
  let data = req.query;
  try {
    NeonDB.then((pool) => 
      pool.query(`SELECT * FROM shifts`)
      .then(result => {
       
        res.status(200).send(result.rows)
      })
      .catch(err => {
        res.status(201).send([])
        console.log(err)
      })
    ) 
  } catch (error) {
    res.status(201).send([])
    console.log(error)
  }
 
})

app.get('/profile', (req,res) => {
  let data = req.query;
  
 
})

app.get('/shift', (req,res) => {
  let data = req.query;
  
 
})

app.get('/inbox', (req,res) => {
  let data = req.query;
  
 
})

app.get('/admin/users', async(req,res) => {
  let data = req.query;
  await NeonDB.then((pool) => 
    pool.query(`
        SELECT * 
        FROM security
    `)
    .then(result => res.status(200).send(result.rows))
    .catch(err => (err))
  ) 
 
})

app.post('/admin/new-shift', parser, async(req,res) => {
  let {period,duration,from,to,security_id} = req.body;
  await NeonDB.then((pool) => 
    pool.query(`
    INSERT INTO shifts(id, security_id, duration, period, time, status, isactive, created_at) VALUES(DEFAULT, '${security_id}', '${duration}', '${period}', '${[from, to]}', '${security_id === undefined ? 'pending' : 'assigned'}', ${false}, '${new Date()}')
    `)
    .then(result => res.status(200).send(true))
    .catch(err => console.log(err))
  ) 
 
})


process.on('unhandledRejection', (reason, promise) => {
  // console.log('Unhandled Rejection at:', reason.stack || reason)
  // Recommended: send the information to sentry.io
  // or whatever crash reporting service you use  
});
