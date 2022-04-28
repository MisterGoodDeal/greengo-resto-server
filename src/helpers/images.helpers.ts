import { ImgurClient } from "imgur";
import { ImgurAPIResponse } from "../utils/interfaces";
const env = require("dotenv").config();

/**
 *
 * @param image Image to upload in Base64 format
 * @returns {Promise<ImgurAPIResponse>} Returns an object containing Imgur API response (ImgurAPIResponse in src/utils/interfaces.ts)
 */
const upload = async (image: string) => {
  // https://www.npmjs.com/package/imgur
  const client = new ImgurClient({ clientId: process.env.IMGUR_CLIENT_ID });

  // @ts-ignore
  const response: ImgurAPIResponse = await client.upload({
    image: image.replace(/^data:image\/[a-z]+;base64,/, ""),
    type: "base64",
  });

  return response;
};

export const images = {
  upload,
};
