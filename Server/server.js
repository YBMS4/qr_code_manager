const http = require("http");
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const {readQrCode, createQr} = require("./utils/qr_manager");
const {getUser, getUsersQrCodes, addQrCode, getQrCode, getQrOwner, verifyUserId} = require("./database/db");
const path = require("path");
const fs = require("fs");
const testToken = require("./test");

// testToken(); // Just to create a simple QR img locally on the server
const app = express();
const upload = multer({ dest: 'uploads/' }); // Temporary Storage
const server = http.createServer(app);

function multerErrorHandler(req, res, next) {
    return upload.single("image")(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            console.error("Multer error:", err, "\n//---> Can Continue...");
            return res.status(500).send("Multer error");
        } else if (err) {
            console.error("Unknown error:", err, "\n//---> Can Continue...");
            return res.status(500).send("Unknown error");
        }

        next();
    });
}

app.use(cors());

app.post("/login", express.json(), (req, res) => {
    try {
        
        const {email, password} = req.body;
        const user = getUser({email, password});

        if (user) {
            res.status(200).json(user); // returns {name, email, userId}
        } else {
            res.status(401).send("Invalid credentials");
        }   

    } catch (error) {
        console.error("Error in '/login':", error);
        res.status(500).send("Internal Server Error");
    }

    console.log("\n############### -> path: '/login' solicited");
});
app.get("/userQRs/:userId", (req, res) => {
    try {

        const {userId} = req.params;
        const qrCodes = getUsersQrCodes(userId).map(qr => {return {id: qr.id, name: qr.name, ownerId: qr.ownerId};});
        // console.log(qrCodes); // Debugging
        // console.log(userId); // Debugging
        res.status(200).json({userQRCodes: qrCodes});   
    
    } catch (error) {
        console.error("Error in '/userQRs':", error);
        res.status(500).send("Internal Server Error");
    }

    console.log("\n############### -> path: '/userQRs' solicited");
});

app.get("/qrCode/:qrId", (req, res) => {
    const {qrId} = req.params;
    const qrCode = getQrCode(qrId);

    if (qrCode) {
        
        res.setHeader("Content-Type", "image/png");
        res.setHeader("Content-Disposition", `attachment; filename=qr_${qrId}.png`);
        res.send(qrCode.buffer);

    } else {
        res.status(404).send("QR code not found");
    }

    console.log("\n############### -> path: '/qrCode' solicited");
});

app.post("/createQr", express.json(), async (req, res) => {
    try {
        const {userId, name, message} = req.body;

        if(!userId || !message || !name) return res.status(400).send("Missing userId, name or message");
        if(!verifyUserId(userId)) return res.status(400).send("Invalid userId");

        // console.log("userID:", userId); // Debugging
        // console.log("name:", name); // Debugging
        // console.log("message:", message); // Debugging

        const id = Date.now().toString();
        await addQrCode({ownerId: userId, content: {id: id, content: message}, name: name});

        console.log("QR code created");
        res.status(201).send("QR code created successfully");

    } catch (error) {
        console.error("Error in '/createQr':", error);
        res.status(500).send("Internal Server Error");
    }
    
    console.log("\n############### -> path: '/createQr' solicited");
});

app.post("/scanQr", multerErrorHandler, async (req, res) => {
    try {
        if (!req.file || !req.file.mimetype.includes("image")) {
            return res.status(400).send("No file uploaded or File Format Invalid.");
        }

        const filePath = req.file.path;
        const result = await readQrCode({filePath: filePath, callback: () => {
            try {
                fs.unlinkSync(filePath);
                console.log("Callback executed: File sucessfully deleted.");
            } catch (error) {
                console.error("Error in callback:", error);
            }
        }});

        // console.log("result:", result); // Debugging

        if(result.value) {
            const owner = getQrOwner(result.value.id);
            
            if(!owner) {
                console.error("QR code owner not found");
                return res.status(404).send("QR code Invalid");
            };

            // console.log(result.value); // Debugging
            res.json({...result.value, owner: owner, name: getQrCode(result.value.id).name}); // will return {iat, id, content, name, owner}
        } else {
            (result.error) ? console.error(result.error) : console.error("Unknown error");
            res.status(400).send("Invalid QR code.");
        }
    } catch (error) {
        // console.error(error); // Debugging
        console.error("Error in '/scanQr':", error);
        res.status(500).send("Internal Server Error");
    }


    console.log("\n############### -> path: '/scanQr' solicited");
});

// ------> Test QR code scanning
app.post("/testDecodeQr", multerErrorHandler, async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).send("No file uploaded.");
        }

        const filePath = req.file.path;
        const result = await readQrCode({filePath: filePath, callback: () => {
            try {
                fs.unlinkSync(filePath);
                console.log("Callback executed: File sucessfully deleted.");
            } catch (error) {
                console.error("Error in callback:", error);
            }
        }});

        console.log("result:", result);

        if(result.value) {
            console.log(result.value);
            res.json(result.value);
        } else {
            (result.error) ? console.error(result.error) : console.error("Unknown error");
            res.status(400).send("Invalid QR code.");
        }
    } catch (error) {
        console.error("Error in '/decodeQr':", error);
        res.status(500).send("Internal Server Error");
    }


    console.log("\n############### -> path: '/tesDecodeQr' solicited");
});

const PORT = 3001;
const host = "localhost";

server.listen(PORT, host, () => {
    console.log(`Server is running on http://${host}:${PORT}`);
});