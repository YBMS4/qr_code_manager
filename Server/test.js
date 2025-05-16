
const {readQrCode, createQr} = require("./utils/qr_manager");
const path = require("path");
const fs = require("fs");
module.exports = async function test(){
    createQr({
        content: {id: "0", content: "Hello world", name:"Serveurybms"},
        filename: "test",
        outputIsBuffer: false
    }).then(async () => {
        console.log("QR code created");

        await readQrCode({filePath: path.join(__dirname, "myQRs/test.png")}).then((value) => {
            console.log(value);
        }).catch((err) => {
            console.error(err, "\n You can go....");
        });
    }).catch((err) => {
        console.error(err);
    });
};