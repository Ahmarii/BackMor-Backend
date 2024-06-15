const fs = require('fs');
const { Client } = require('pg');


const x = process.env.db_cd

const fixedCertificate = x.replace(/\\n/g, '\n');

    
// PostgreSQL connection configuration
const config = {
    user: "avnadmin",
    password: process.env.db_password,
    host: "cpre88-jayc.g.aivencloud.com",
    port: 14871,
    database: "maindb",
    ssl: {
        rejectUnauthorized: true,
        ca: fixedCertificate
        ,
    },
};

(async function initializeDatabase() {
    db = new Client(config);
    try {
        await db.connect();
        console.log("Connected to the database");
    } catch (err) {
        console.error("Error connecting to the database", err);
        throw err;
    }
})();


async function closedb(db) {
    try {
        await db.end();
        console.log("Disconnected from the database");
    } catch (err) {
        console.error("Error disconnecting from the database", err);
    }
}



async function test() {
    await db.query(`SELECT * FROM public.username_password WHERE username = 'slim'`, (err, res) => {
        if (err) {
            console.error(err)
        } else {
            console.log(res.rows)
        }
    })
}

// test()

module.exports = {
    db,
    closedb,
};
