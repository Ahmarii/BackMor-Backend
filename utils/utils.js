const { db, closedb } = require('../database/db_main.js');
const multer = require('multer');
const path = require('path')


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'public');
    },
    filename: async function (req, file, cb) {
      const username = req.user.username; // assuming username is sent in the body
      const timestamp = Date.now();
      const extension = path.extname(file.originalname);

      const filename = `${timestamp}_${username}${extension}`

      cb(null, filename);
    }
  });
  
const upload = multer({ storage: storage });

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



function getProfileImage(id) {
    return new Promise((resolve, reject) => {
        db.query(`SELECT images_name FROM images JOIN username_password ON images.user_id = username_password.id WHERE id = $1;`, [id], (err, res) => {
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
        // Attempt to insert the image
        db.query(
            `INSERT INTO public.images (user_id, images_name) VALUES ($1, $2) 
             ON CONFLICT (user_id) DO UPDATE SET images_name = EXCLUDED.images_name 
             RETURNING images_id`,
            [id, name],
            (err, res) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(res.rows[0]);
                }
            }
        );
    });
}


function getProfileImageByName(username) {
    return new Promise((resolve, reject) => {
        db.query(`SELECT images_name FROM images JOIN username_password ON images.user_id = username_password.id WHERE username = $1;`, [username], (err, res) => {
            if (err) {
                reject(err)
            } else {
                resolve(res.rows[0])
            }
        })
    })
}

function getUserdataByEmail(email) {
    return new Promise((resolve, reject) => {
        db.query(`SELECT * FROM public.username_password WHERE email = $1`, [email], (err, res) => {
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

function getCustomerDataByUsername(username) {
    return new Promise((resolve, reject) => {
        db.query(`SELECT * FROM public.customerdata JOIN username_password ON customerdata.user_id = username_password.id WHERE username = $1;`, 
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

async function createProfile(firstname, lastname, id) {
    await db.query(`INSERT INTO public.customerdata (firstname, lastname, user_id) VALUES ($1, $2, $3)`, [firstname, lastname, id], function(err) {
        if (err) {
            console.log("ERRORRRR", err.message)
        } else {
            console.log('Profile created.')
        }
    })
};

function searchUsername (username) {
    return new Promise((resolve, reject) => {
        db.query(`SELECT username FROM public.username_password WHERE username LIKE '%' || $1 || '%'`, [username],
            (err, data) => {
                if (err) {
                    console.log('Search fail.')
                    reject(err);
                } else {
                    console.log('Search complete.')
                    resolve(data.rows);
                }
            }
        )
    })
};



async function insertUser(username, password, email) {
    await db.query(`INSERT INTO public.username_password (username, password, email) VALUES ($1, $2, $3)`, [username, password, email], function(err) {
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
        console.log(`Fullname update`)
    })
}

async function updateUsername(data, id) {
    await db.query(`UPDATE public.username_password SET username = $1 WHERE id = $2`, [data.username, id], function(err) {
        if (err) {
            console.log('Username update error.')
            return console.error(err.message)
        }
        console.log(`Username update`)
    })
}

async function checkFriendReq (id, friendId) {
    return new Promise((resolve, reject) => {
        db.query(`SELECT * FROM public.friend_req WHERE user_id = $1 AND friend_req = $2`, [id, friendId],
            (err, data) => {
                if (err) {
                    console.log('Check friend req error.')
                    reject(err);
                } else {
                    console.log('Friend req check sended.')
                    resolve(data.rows[0]);
                }
            }
        )
    })
};

async function addFriend (id, friendId ) {
    const checker = await checkFriendReq(id, friendId)
    console.log(checker)
    if (checker) {
        console.log('Already sended')
        return 
    }
    await db.query(`INSERT INTO public.friend_req (user_id, friend_req) VALUES ($1, $2)`, [id , friendId], function(err) {
        if (err) {
            console.log('Req sended fail.')
            return console.error(err.message)
        }
        console.log(`Req sended.`)
    })
}

async function getFriendReq (user_id) {
    return new Promise((resolve, reject) => {
        db.query(`SELECT username FROM public.username_password JOIN friend_req ON username_password.id = friend_req.friend_req WHERE friend_req.user_id = $1`, [user_id],
            (err, data) => {
                if (err) {
                    console.log('Friend lsit req error.')
                    reject(err);
                } else {
                    console.log('Friend req list sended.')
                    resolve(data.rows);
                }
            }
        )
    })
};

async function cancelFriendReq (username) {
    await db.query(`DELETE FROM friend_req WHERE friend_req.friend_req IN ( SELECT username_password.id FROM username_password WHERE username_password.username = $1);`, 
        [username], function(err) {
        if (err) {
            console.log('Username update error.')
            return console.error(err.message)
        }
        console.log(`Username update`)
    })
}

module.exports = {
    getUserdata,
    getCustomerData,
    createProfile,
    insertUser,
    updateData,
    getUserdataByid,
    getCustomerDataByUsername,
    getProfileImage,
    uploadProfileImage,
    getProfileImageByName,
    upload,
    getUserdataByEmail,
    updateUsername,
    searchUsername,
    checkFriendReq,
    addFriend,
    getFriendReq,
    cancelFriendReq
}