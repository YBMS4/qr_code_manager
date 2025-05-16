# QR Code Manager

This repository demonstrates how to generate and scan QR codes using Node.js and a web application.  
It's really powerful, and you can:

- Add a logo  
- Change colors  
- Resize the QR code  
- And more...

I didn’t even know it was possible to scan a QR code from an image file (without using the webcam) until now—and I certainly didn’t know it could recognize a QR code even if it's not centered in the image. That’s pretty cool.

Anyway, enjoy the code and feel free to use it as a reference or play around with it.

---

## Modules Used

### 1. Front-End

- React  
- Sass  

### 2. Back-End with Node.js

- Express.js  
- CORS  
- Jimp: for merging the logo with the QR code  
- jsonwebtoken: for managing tokens (generation, signing, decoding)  
- multer: for receiving files (images) from the front-end  
- qrcode: for generating QR codes  
- qrcode-reader: as the name suggests, for decoding QR codes  

---

## Workflow

### Front-End

1. The user logs into the server using their email and password.  
2. They can:

   #### In Section 1: **Manage QR Codes**
   - Create a QR code  
   - View a list of their QR codes stored on the server  
   - View individual QR codes  
   - Download them for sharing  

   #### In Section 2: **Scan QR Codes**
   - Upload an image  
   - Scan the image to detect a QR code and extract its data  

---

### Back-End

1. `POST /login`: Authenticates the user using email and password.  
   - **Success**: Response = `status: 200, json: { name, email, userID }`  
   - **Failure**: Response = `status: 404 or 500, message: string`  

2. `GET /userQRs/:userId`: Returns an array of the user's QR codes stored in the database.  
   - **Success**: Response = `status: 200, json: { userQRCodes: Array<{ name, id, ownerId }> }`  
   - **Failure**: Response = `status: 500, message: string`  

3. `GET /qrCode/:qrId`: Returns the QR code image buffer. This can be used in an `<img />` tag.  

4. `POST /createQr`: Creates a QR code and stores it in the database.  
   - **Required parameters**: `{ userId, message, name }`  
   - **Success**: `status: 201, message: string`  
   - **Failure**: `status: 500, message: string`  

5. `POST /scanQr`: Receives a QR code image from the client and scans it.  
   - **Expected input**: `{ image }`, received via the `multer` middleware  
   - **Success**: `status: 200, json: { iat, id, content, name, owner }`  
   - **Failure**: `status: 400, 404, or 500, message: string`  