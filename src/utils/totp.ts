import speakeasy from 'speakeasy';

// Generate a secure TOTP secret for a user
export const generateTOTP = (username: string) => {
  const secret = speakeasy.generateSecret({ length: 20, name: `Authentify.tech:${username}`, issuer: 'Authentify.tech'});
  return {
    ascii: secret.ascii,
    hex: secret.hex,
    base32: secret.base32,
    otpauth_url: secret.otpauth_url,
  };
};

// Encode secret in base32
// export const encodeSecret = (secret: base32.Input) => {
//   return base32.encode(secret);
// };

// // Generate QR Code for scanning
// export const generateQR = async (otpauth_url: string) => {
//   return new Promise((resolve, reject) => {
//     qrcode.toDataURL(otpauth_url, (err, qrcode) => {
//       if (err) {
//         reject(err);
//       }
//       resolve(qrcode);
//     });
//   });
// };

// Verify TOTP Token
export const verifyTOTP = (secret: any, token: any) => {
  return speakeasy.totp.verify({
    secret: secret,
    encoding: 'base32',
    token: token,
    window: 2
  });
};

