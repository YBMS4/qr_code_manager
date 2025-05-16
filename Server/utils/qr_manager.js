const QRCode = require('qrcode');
const { Jimp } = require('jimp');
const qrReader = require("qrcode-reader");
const fs = require('fs');
const path = require('path');
const { generateToken, verifyToken, decodeToken } = require("./tokens_management");

/**
 *
 * @param {{filename: string, content: {id: String, content: string}, outputIsBuffer?: boolean}} options
 * @returns {Promise<Buffer> | Promise<void>}
 */
async function createQr(options) {
//   console.log("options: ", options); // Debugging
  const qr = await QRCode.toBuffer(generateToken({content : options.content}), {
    errorCorrectionLevel: 'H',
    type: 'png',
    width: 500,
    "margin" : 4,
    "color" : {
        light: "#FFFFFF",
        dark: "#0000FF"
    }
  });

  const qrImage = await Jimp.read(qr);
  const logo = await Jimp.read(path.join(__dirname, '../ressources/MyLogo2.png')); // Ne Peut pas gerer les SVG
  logo.resize({w: 40, h: 40}); // Logo Size, The Smaller The Better

// ---> Logo Position configuration
//   const x = (qrImage.bitmap.width / 2) - (logo.bitmap.width / 2);
//   const y = (qrImage.bitmap.height / 2) - (logo.bitmap.height / 2);
//   qrImage.composite(logo, x, y);

  qrImage.composite(logo, 0, 0);


  if(options.outputIsBuffer) {
    return await qrImage.getBuffer("image/png");
  }else{
    await qrImage.write(path.join(__dirname, '../myQRs/' + `${options.filename || "unamed_qr"}.png`));
  }
};

/**
 * 
 * @param {{filePath: string, callback?: () => void}} options
 * @returns {Promise<{value?: {content: string, id: string}, error?: Error}>} 
 */
async function readQrCode(options) {
    const promise = new Promise(async (resolve, reject) => {
        const image = await Jimp.read(options.filePath);
        const qr = new qrReader();

        qr.callback = (err, value) => {
            
            // console.log("pass 1"); // Debugging
            if (err) {
                console.error(err);
                reject(err);
                return;
            }
            // console.log("pass 2"); // Debugging

            if (!value) {
                reject(new Error("No QR code found"));
                return;
            }

            // console.log("QR Value:", value.result); // Debugging
            const decoded = verifyToken(value.result);
                
            if(value.result && decoded) {
                if(decoded && decoded.content && decoded.id) {
                    resolve({value: decoded});
                }else{
                    reject({error: new Error("Invalid QR code")});
                }
            }else{
                reject(new Error("Invalid QR code"));
            }
        };

        qr.decode(image.bitmap);
    });

    promise.then(value => value).catch(err => err).finally(() => {if(options.callback) options.callback();});

    return await promise;
};

module.exports = {
    createQr: createQr,
    readQrCode: readQrCode
}