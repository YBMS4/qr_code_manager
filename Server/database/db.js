const { createQr } = require("../utils/qr_manager");

/**
 * @type {{
 *  users: Record<string, {uuid: string, name: string, email: string, password: string}>,
 *  qrCodes: Record<string, {id: string, name: string, ownerId: string, buffer: Buffer}>,
 * }}
 */
const myDatabase = {
    users: {
        "0": {
            uuid: "0",
            name: "Sekiro Shadow",
            email: "sekiro@example.com",
            password: "securepassword"
        },
        "1": {
            uuid: "1",
            name: "Monica Doe",
            email: "monica@example.com",
            password: "securepassword"
        }
    },

    qrCodes: {}
};

/**
 *
 * @param {{email: string, password: string}} data
 * @returns {{name: string, email: string, userId: string} | null}
 */
function getUser(data) {
    const user = Object.values(myDatabase.users).find(user => user.email === data.email && user.password === data.password);
    
    if (user) {
        return {
            userId: user.uuid,
            name: user.name,
            email: user.email
        };
    }

    return null;
}

/**
 *
 * @param {{ownerId: string, content: {id: string, content: string}, name: string}} data
 */
async function addQrCode(data) {
    myDatabase.qrCodes[data.content.id] = {
        id: data.content.id,
        name: data.name,
        ownerId: data.ownerId,
        buffer: await createQr({content: data.content, outputIsBuffer: true})
    };
}

 /**
 *
 * @param {{userId: string}} userId
 * @returns {{id: string, ownerId: string, buffer: Buffer, name: string}[]}
 */
function getUsersQrCodes(userId) {
    return Object.values(myDatabase.qrCodes).filter(qrCode => qrCode.ownerId === userId);
}

function getQrCode(id) {
    return myDatabase.qrCodes[id];
}

/**
 * 
 * @param {string} id 
 * @returns {string}
 */
function getQrOwner(id) {
    const qrCode = myDatabase.qrCodes[id];
    // console.log("qr:", qrCode); // Debugging
    if (qrCode) {
        return myDatabase.users[qrCode.ownerId].name;
    }
    return null;
}

function verifyUserId(id) {
    return myDatabase.users[id] !== undefined;
}

module.exports = {
    getUser: getUser,
    addQrCode: addQrCode,
    getUsersQrCodes: getUsersQrCodes,
    getQrCode: getQrCode,
    getQrOwner: getQrOwner,
    verifyUserId: verifyUserId
};