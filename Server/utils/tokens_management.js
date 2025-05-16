const jwt = require('jsonwebtoken');

// ---> Never do this in production
// ---> Use a .env file or a secret manager
const JWT_SECRET = "MY_JWT_SECRET_KEY_YBMS";
/**
 * @param {{content: string}} payload 
 * @returns {string}
 */
function generateToken(payload) {
    return jwt.sign(payload.content, JWT_SECRET);
}

/**
 * 
 * @param {string} token 
 * @returns {{id: string, content: string} | null}
 */
function verifyToken(token) {
    try {
        console.log("Verified Token:", jwt.verify(token, JWT_SECRET))
        return jwt.verify(token, JWT_SECRET);   
    } catch (error) {
        console.error("Token verification failed:", error);
        return null;
    }
}

/**
 * 
 * @param {string} token 
 * @returns {{id: string, content: string, name: string}}
 */
function decodeToken(token) {
    const decoded = jwt.decode(token, {"complete" : true});
    if (!decoded && !decoded.content && !decoded.id && !decoded.name) {
        return null;
    }

    // console.log("decoded:", decoded); // Debugging

    return {id: decoded.id, content: decoded.content, name: decoded.name};
}

module.exports = {
    generateToken: generateToken,
    verifyToken: verifyToken,
    decodeToken: decodeToken
};