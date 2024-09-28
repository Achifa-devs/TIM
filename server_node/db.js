const { resolve } = require('path');
const {Client,Pool} = require('pg');

let  DATABASE_URL  = "postgresql://achifa.io.llc:cflV8XEbCO7h@ep-billowing-sunset-28191429-pooler.us-east-2.aws.neon.tech/TIM?sslmode=require";
let NeonDB = new Promise((resolve, reject) => {

    /*let pool = new Pool({ 
        host: _,
        port: 5432,
        user: "Achifa",
        password: "HBsb6tVagN1p",
        database: "neondb"
    });*/
    try{ 

    
        const pool = new Pool({
            connectionString: DATABASE_URL,
            ssl: {
                rejectUnauthorized: false,
            },
            createTimeoutMillis: 8000,
            connectionTimeoutMillis: 10000000,
            acquireTimeoutMillis: 8000,
            idleTimeoutMillis: 8000,
            reapIntervalMillis: 1000,
            createRetryIntervalMillis: 100
        });
        
        let conn = pool.connect(); 
        if(conn){
            resolve(pool);
        }else{
            reject(conn);
        }
    }
    catch(err){
        console.log('database error: ',err)
    }
    
})

module.exports = { 
    NeonDB
}
