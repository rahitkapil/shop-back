"use strict";

const crypto = require('crypto');
const algorithm = 'aes-256-cbc';
const key = crypto.randomBytes(32);
const iv = crypto.randomBytes(16);

function decrypt22(text) {
let iv = Buffer.from(text.iv, 'hex');
 let encryptedText = Buffer.from(text.encryptedData, 'hex');
 let decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key), iv);
 let decrypted = decipher.update(encryptedText);
 decrypted = Buffer.concat([decrypted, decipher.final()]);
 return decrypted.toString();
}


exports.decrypt = text => {
    console.log('from decrypt');
    console.log(text);
 let iv = Buffer.from(text.iv, 'hex');
   console.log(iv);
 let encryptedText = Buffer.from(text.encryptedData, 'hex');
   console.log(encryptedText);
 let decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key), iv);
   console.log(decipher);
 let decrypted = decipher.update(encryptedText);
   console.log(text);
 decrypted = Buffer.concat([decrypted, decipher.final()]);
   console.log(decrypted);
 return decrypted.toString();
};

 const decrypt1 = (text) => {
   let iv = Buffer.from(text.iv, 'hex');
 let encryptedText = Buffer.from(text.encryptedData, 'hex');
 let decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key), iv);
 let decrypted = decipher.update(encryptedText);
 decrypted = Buffer.concat([decrypted, decipher.final()]);
 return decrypted.toString();
};


 const encrypt = (text) => {
   let cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key), iv);
 let encrypted = cipher.update(text);
 encrypted = Buffer.concat([encrypted, cipher.final()]);
 return { iv: iv.toString('hex'), encryptedData: encrypted.toString('hex') };
};