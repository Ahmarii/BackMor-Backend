const { db, closedb } = require('../database/db_main.js');

function getUserdataByid(id) {
    return new Promise((resolve, reject) => {
        db.query(`SELECT * FROM public.username_password WHERE id = $1`, [id], (err, res) => {
            if (err) {
                reject(err)
            } else {
                resolve(res.rows[0])
            }
        })
    })
}

function uploadProfileImage(name, id) {
    return new Promise((resolve, reject) => {
        db.query(`INSERT INTO public.images (user_id, image_name ) VALUES ($1, $2) RETURNING images_id`, [id, name], (err, res) => {
            if (err) {
                reject(err)
            } else {
                resolve(res.rows[0])
            }
        })
    })  
}

function getProfileImage(id) {
    return new Promise((resolve, reject) => {
        db.query(`SELECT image_name FROM images JOIN username_password ON images.user_id = username_password.id WHERE id = $1;`, [id], (err, res) => {
            if (err) {
                reject(err)
            } else {
                resolve(res.rows[0])
            }
        })
    })
}


function getUserdata(username) {
    return new Promise((resolve, reject) => {
        db.query(`SELECT * FROM public.username_password WHERE username = $1`, [username], (err, res) => {
            if (err) {
                reject(err)
            } else {
                resolve(res.rows[0])
            }
        })
    })
}

function getCustomerDataByName(username) {
    return new Promise((resolve, reject) => {
        db.query(`SELECT * FROM customerdata JOIN username_password ON customerdata.user_id = username_password.id WHERE username = $1;`, 
            [username],
            (err, data) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(data.rows[0]);
                }
            }
        )
    })
}

function getCustomerData(id) {
    return new Promise((resolve, reject) => {
        db.query(`SELECT * FROM public.customerdata WHERE user_id = $1`, [id],
            (err, data) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(data.rows[0]);
                }
            }
        )
    })
};

async function createProfile(id) {
    await db.query(`INSERT INTO public.customerdata (firstname, lastname, user_id) VALUES ('sam', 'smith', $1)`, [id], function(err) {
        if (err) {
            console.log("ERRORRRR", err.message)
        } else {
            console.log('Profile created.')
        }
    })
};



async function insertUser(username, password) {
    await db.query(`INSERT INTO public.username_password (username, password) VALUES ($1, $2)`, [username, password], function(err) {
        if (err) {
            console.error('ERROR', err.message)
        } else {
            console.log('User inserted')
        }
    })};


async function updateData(data, id) {
    await db.query(`UPDATE public.customerdata SET firstname = $1, lastname = $2 WHERE user_id = $3`, [data.firstname, data.lastname, id], function(err) {
        if (err) {
            return console.error(err.message)
        }
        console.log(`Row update`)
    })
}



module.exports = {
    getUserdata,
    getCustomerData,
    createProfile,
    insertUser,
    updateData,
    getUserdataByid,
    getCustomerDataByName,
    getProfileImage,
    uploadProfileImage
}