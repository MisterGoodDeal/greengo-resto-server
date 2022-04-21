import { verifyJwt } from "../utils/jwt";
import { returnCode } from "../utils/returnCodes";

export const auth = (req: any, res: any, next: any) => {
  const token = req.headers["x-auth"];

  if (!token) {
    return res
      .status(returnCode.missingToken.code)
      .send(returnCode.missingToken.payload);
  }
  try {
    const user = verifyJwt(token);
    req.user = user;
  } catch (err) {
    return res
      .status(returnCode.invalidToken.code)
      .send(returnCode.invalidToken.payload);
  }
  return next();
};
