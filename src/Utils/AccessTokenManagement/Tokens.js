import dotenv from "dotenv";
import * as jose from "jose";
import keyGen from "./keyGen.js";
const envConfig = dotenv.config({ path: "../../../.env" }).parsed;
const endpoint = envConfig ? envConfig["ENDPOINT"] : "localhost";
const { publicKey, privateKey } = keyGen;

export const tokenGen = async (user, tokenType) => {
  return await new jose.EncryptJWT({
    uid: user.id,
    userType: user.userType,
    ref: tokenType === tokenType.refresh ? user._id : "",
    tokenType: tokenType ? tokenType : "auth",
  })
    .setProtectedHeader({ alg: "RSA-OAEP-256", enc: "A256GCM" })
    .setIssuedAt(new Date().getTime())
    .setIssuer(endpoint)
    .setAudience(endpoint)
    .setExpirationTime(tokenType === "refresh" ? "30d" : "2d")
    .encrypt(publicKey);
};

export const joseJwtDecrypt = async (token, PK = privateKey) => {
  try {
    const decryptedToken = await jose.jwtDecrypt(token, PK);
    return decryptedToken;
  } catch (error) {
    console.log(error);
    return false;
  }
};
