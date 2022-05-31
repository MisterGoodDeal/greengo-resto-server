import { Request, Response } from "express";
import { db } from "../db";
import { images } from "../helpers/images.helpers";
import { auth } from "../middleware/auth";
import { Group } from "../utils/groups/interfaces";
import { groupReturnCode } from "../utils/groups/returnCodes";
import { MySQLResponse, JWTProps } from "../utils/interfaces";
import { Place } from "../utils/places/interfaces";
import { placesReturnCode } from "../utils/places/returnCodes";
import { returnCode } from "../utils/returnCodes";

const places = (app: any) => {
  // Create place
  app.post("/place/create", auth, async function (req: Request, res: Response) {
    // @ts-ignore
    const user: JWTProps = req.user;
    const {
      group_key,
      country_speciality,
      lat,
      lng,
      name,
      rating,
      price_range,
      can_bring_reusable_content,
      image,
    } = req.body;
    if (
      !group_key ||
      !country_speciality ||
      !lat ||
      !lng ||
      !name ||
      !rating ||
      !price_range ||
      !can_bring_reusable_content
    ) {
      res.status(returnCode.missingParameters.code).json({
        payload: returnCode.missingParameters.payload,
        body: req.body,
      });
    } else {
      // Check if the group exists
      const group: Group[] = await db.queryParams(
        "SELECT * FROM LunchGroups WHERE group_key = ?",
        [group_key]
      );
      if (group.length === 0) {
        res
          .status(groupReturnCode.groupNotFound.code)
          .json(groupReturnCode.groupNotFound.payload);
      } else {
        // If there is an image, upload it
        let imgurImg: string | null = null;
        if (image) {
          const uploadRes = await images.upload(image);
          uploadRes.success ? (imgurImg = uploadRes.data.link) : null;
        }

        // Insert the place
        const place: MySQLResponse = await db.queryParams(
          "INSERT INTO LunchPlaces (name, fk_country_speciality, lat, lng, rating, price_range, can_bring_reusable_contents, image, fk_lunch_group, fk_user) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
          [
            name,
            country_speciality,
            lat,
            lng,
            rating,
            price_range,
            can_bring_reusable_content,
            imgurImg,
            group[0].id,
            user.id,
          ]
        );
        if (place.affectedRows > 0) {
          const newPlace = await db.queryParams(
            "SELECT * FROM LunchPlaces WHERE id = ?",
            [place.insertId]
          );
          res.status(200).json(newPlace);
        }
      }
    }
  });

  // Get all places from a group
  app.get(
    "/place/:group_key",
    auth,
    async function (req: Request, res: Response) {
      // @ts-ignore
      const user: JWTProps = req.user;
      const { group_key } = req.params;
      const group: Group[] = await db.queryParams(
        "SELECT * FROM LunchGroups WHERE group_key = ?",
        [group_key]
      );
      if (group.length === 0) {
        res
          .status(groupReturnCode.groupNotFound.code)
          .json(groupReturnCode.groupNotFound.payload);
      } else {
        const places: Place[] = await db.queryParams(
          "SELECT * FROM LunchPlaces WHERE fk_lunch_group = ?",
          [group[0].id]
        );
        res.status(200).json(places);
      }
    }
  );

  // Delete place
  app.delete("/place/:id", auth, async function (req: Request, res: Response) {
    // @ts-ignore
    const user: JWTProps = req.user;
    const { id } = req.params;
    // check if the user is the owner of the group
    const place: Place[] = await db.queryParams(
      "SELECT * FROM LunchPlaces WHERE id = ?",
      [id]
    );
    if (place.length === 0) {
      res
        .status(placesReturnCode.placeNotFound.code)
        .json(placesReturnCode.placeNotFound.payload);
    } else {
      const deletePlace: MySQLResponse = await db.queryParams(
        "DELETE FROM LunchPlaces WHERE id = ?",
        [id]
      );
      if (deletePlace.affectedRows > 0) {
        res
          .status(placesReturnCode.placeDeleted.code)
          .json(placesReturnCode.placeDeleted.payload);
      }
    }
  });
};

export default places;
