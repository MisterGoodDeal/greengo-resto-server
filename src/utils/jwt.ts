const env = require("dotenv").config();
import { JWTProps } from "./interfaces";
const jwt = require("jsonwebtoken");

export const generateToken = (jwtProps: JWTProps): string => {
  const token = jwt.sign(
    {
      id: jwtProps.id,
      firstname: jwtProps.firstname,
      lastname: jwtProps.lastname,
      email: jwtProps.email,
      profile_picture: jwtProps.profile_picture,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRATION,
    }
  );
  return token;
};

export const verifyJwt = (token: string): JWTProps => {
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  return decoded as JWTProps;
};
