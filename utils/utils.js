const { db, closedb } = require('../database/db_main.js');
const multer = require('multer');
const path = require('path');


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

// Event query

function getAlltag () {
    return new Promise((resolve, reject) => {
        db.query(`SELECT tag_name, tag_emoji FROM public.tag`,
            (err, data) => {
                if (err) {
                    console.log('get tag fail.')
                    reject(err);
                } else {
                    console.log('get tag complete.')
                    resolve(data.rows);
                }
            }
        )
    })
};

function searchTag (tagName) {
    return new Promise((resolve, reject) => {
        // console.log(tagName)
        db.query(`SELECT tag_name, tag_emoji FROM public.tag WHERE tag_name ILIKE '%' || $1 || '%'`, [tagName],
            (err, data) => {
                if (err) {
                    console.log('Search tag fail.')
                    reject(err);
                } else {
                    console.log('Search tag complete.')
                    // console.log(data.rows)
                    resolve(data.rows);
                }
            }
        )
    })
};

async function createEvent(eventObj, id) {
    try {
        // Insert event and get the new event_id
        const eventResult = await db.query(
            `INSERT INTO public.event (event_name, date_time, place, max_people, event_detail, event_tag, event_creator) 
             VALUES ($1, $2, 'morchit', $3, $4, $5, $6) RETURNING event_id`,
            [eventObj.eventName, eventObj.eventDateTime, eventObj.maxPeople, eventObj.eventDetail, eventObj.eventTags, id]
        );

        const insertedId = eventResult.rows[0].event_id; // Get the new event ID
        // console.log(`Event created with ID: ${insertedId}`);

        // Insert into event_member table
        await db.query(
            `INSERT INTO public.event_member (id_of_event, user_id) VALUES ($1, $2)`,
            [insertedId, id]
        );
        // console.log(`User ID ${id} added to event ID ${insertedId}`);
        
    } catch (err) {
        console.error('Error:', err.message);
        throw err; // Optionally re-throw the error to handle it higher up if needed
    }
}


async function removeEvent (event_id) {

    await db.query(`DELETE FROM public.event_member WHERE id_of_event = $1`, [event_id], function(err) {
        if (err) {
            console.log('remove event member error.')
            return console.error(err.message)
        }
        console.log(`remove event member success.`)
    })

    await db.query(`DELETE FROM public.event WHERE event_id = $1`, [event_id], function(err) {
        if (err) {
            console.log('remove event error.')
            return console.error(err.message)
        }
        console.log(`remove event success.`)
    })

}

async function joinEvent (event_id, user_id) {
    const checker = await joinEventCheck(event_id, user_id)

    if (checker) {
        return console.error('Already Join.')
    } else {
        await db.query(`INSERT INTO public.event_member (id_of_event, user_id) VALUES ($1, $2)`, [event_id, user_id], function(err) {
            if (err) {
                console.log('join event error.')
                return console.error(err.message)
            }
            console.log(`join event success.`)
        })
    }
}

async function joinEventCheck (event_id, user_id) {
    return new Promise((resolve, reject) => {
        db.query(`SELECT * FROM public.event_member WHERE id_of_event = $1 AND user_id = $2`, [event_id, user_id],
            (err, data) => {
                if (err) {
                    console.log('joinEventCheck error.')
                    reject(err);
                } else {
                    console.log('joinEventCheck success.')
                    resolve(data.rows[0]);
                }
            }
        )
    })
}

async function cancelJoinEvent(event_id, user_id) {
    const checker = await joinEventCheck(event_id, user_id)

    if (checker) {
        await db.query(`DELETE FROM event_member WHERE user_id = $1 and id_of_event = $2`, [user_id, event_id], function(err) {
            if (err) {
                console.log('cancel join event error.')
                return console.error(err.message)
            }
            console.log(`cancel join event success.`)
        })
    } else {
        return console.error('Have not been joined')
    }
}


async function getEventMember (event_id) {
    return new Promise((resolve, reject) => {
        db.query(`SELECT username FROM username_password 
            JOIN event_member ON event_member.user_id = username_password.id WHERE event_member.id_of_event = $1;`, [event_id],
            (err, data) => {
                if (err) {
                    console.log('event member error.')
                    reject(err);
                } else {
                    console.log('event member sended.')
                    resolve(data.rows);
                }
            }
        )
    })
}

async function getMyEvent (id) {
    return new Promise((resolve, reject) => {
        db.query(`SELECT * FROM public.event WHERE event_creator = $1`, [id],
            (err, data) => {
                if (err) {
                    console.log('My event error.')
                    reject(err);
                } else {
                    console.log('My event sended.')
                    resolve(data.rows);
                }
            }
        )
    })
};

async function getAllevent () {
    return new Promise((resolve, reject) => {
        db.query(`SELECT * FROM public.event`,
            (err, data) => {
                if (err) {
                    console.log('get all event error.')
                    reject(err);
                } else {
                    console.log('get all event sended.')
                    resolve(data.rows);
                }
            }
        )
    })
}

async function getEvent (event_id) {
    return new Promise((resolve, reject) => {
        db.query(`SELECT * FROM public.event WHERE event_id = $1`, [event_id],
            (err, data) => {
                if (err) {
                    console.log('get event error.')
                    reject(err);
                } else {
                    console.log('get event sended.')
                    resolve(data.rows[0]);
                }
            }
        )
    })
}


// Friend query
async function checkFriendReq (id, friendId) {
    return new Promise((resolve, reject) => {
        db.query(`SELECT * FROM public.friend_req WHERE user_id = $1 AND friend_req = $2`, [id, friendId],
            (err, data) => {
                if (err) {
                    console.log('Check friend req error.')
                    reject(err);
                } else {
                    // console.log('Friend req check sended.')
                    resolve(data.rows[0]);
                }
            }
        )
    })
};

async function checkFriendList (id, friendId) {
    return new Promise((resolve, reject) => {
        db.query(`SELECT * FROM public.friend_list WHERE (user_id = $1 AND friend_id = $2) OR (user_id = $3 AND friend_id = $4)`, 
            [id, friendId, friendId, id],
            (err, data) => {
                if (err) {
                    console.log('Check friend list error.')
                    reject(err);
                } else {
                    // console.log('Friend list check sended.')
                    resolve(data.rows[0]);
                }
            }
        )
    })
};

async function addFriend (id, friendId ) {
    const checker = await checkFriendReq(id, friendId)
    console.log('checker', checker)
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

async function getFriendReqedList (id) {
    return new Promise((resolve, reject) => {
        db.query(`SELECT username FROM public.username_password JOIN friend_req ON username_password.id = friend_req.friend_req WHERE friend_req.user_id = $1`, [id],
            (err, data) => {
                if (err) {
                    console.log('Friend lsit req error.')
                    reject(err);
                } else {
                    // console.log('Friend req list sended.')
                    resolve(data.rows);
                }
            }
        )
    })
};

async function getFriendReqList (id) {
    return new Promise((resolve, reject) => {
        db.query(`SELECT username FROM public.username_password JOIN friend_req ON username_password.id = friend_req.user_id WHERE friend_req.friend_req = $1;`, [id],
            (err, data) => {
                if (err) {
                    console.log('Friend lsit req error.')
                    reject(err);
                } else {
                    // console.log('Friend req list sended.')
                    resolve(data.rows);
                }
            }
        )
    })
}

async function cancelFriendReq (id, friend_username) {

    const friend_data = await getUserdata(friend_username)
    const friend_id = friend_data.id

    console.log(id, friend_username, friend_id)

    await db.query(`DELETE FROM public.friend_req WHERE user_id = $1 AND friend_req = $2`, 
        [id, friend_id], function(err) {
        if (err) {
            console.log('Error cancel friend request.')
            return console.error(err.message)
        }
        console.log(`cancel friend request success`)
    })
}

async function acceptFriendReq (id, username) {

    const user_data = await getUserdata(username)
    const friendId = user_data.id

    await db.query(`INSERT INTO public.friend_list (user_id, friend_id) VALUES ($1, $2)`, [id, friendId], 
        function(err) {
        if (err) {
            console.log('Accept friend request Error.')
            return console.error(err.message)
        }
        console.log(`Accept friend request success`)
    })

    await db.query(`DELETE FROM public.friend_req WHERE user_id = $1 AND friend_req = $2`, [friendId, id],
        function(err) {
            if (err) {
                console.log('delete friend request Error.')
                return console.error(err.message)
            }
            console.log(`delete friend request success`)
        }
    )
}

async function denyFriendReq (id, friend_username) {

    const friend_data = await getUserdata(friend_username)
    const friend_id = friend_data.id

    await db.query(`DELETE FROM public.friend_req WHERE user_id = $1 AND friend_req = $2`, 
        [friend_id, id], function(err) {
        if (err) {
            console.log('Error cancel friend request.')
            return console.error(err.message)
        }
        console.log(`cancel friend request success`)
    })
}

async function removeFriend (id, friend_username) {
    const friend_data = await getUserdata(friend_username)
    const friend_id = friend_data.id

    await db.query(`DELETE FROM public.friend_list WHERE (user_id = $1 AND friend_id = $2) OR (user_id = $3 AND friend_id = $4);`,
        [id, friend_id, friend_id, id], function(err) {
            if (err) {
                console.log('Error remove friend.')
                return console.error(err.message)
            }
            console.log(`remove friend success`)
        }
    )
}


async function getFriendList (id) {
    return new Promise((resolve, reject) => {
        db.query(`SELECT DISTINCT public.username_password.username FROM public.friend_list JOIN public.username_password ON public.username_password.id = CASE WHEN public.friend_list.user_id = $1 THEN public.friend_list.friend_id ELSE public.friend_list.user_id END WHERE public.friend_list.user_id = $2 OR public.friend_list.friend_id = $3;`,
            [id, id, id],
            (err, data) => {
                if (err) {
                    console.log('get Friend lsit error.')
                    reject(err);
                } else {
                    // console.log('get Friend list sended.')
                    resolve(data.rows);
                }
            }
        )
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
    getFriendReqedList,
    cancelFriendReq,
    getFriendReqList,
    acceptFriendReq,
    denyFriendReq,
    checkFriendList,
    removeFriend,
    getFriendList,
    getAlltag,
    searchTag,
    createEvent,
    getMyEvent,
    getEvent,
    getAllevent,
    removeEvent,
    joinEventCheck,
    joinEvent,
    cancelJoinEvent,
    getEventMember
}