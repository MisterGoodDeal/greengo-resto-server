import { Request, Response } from "express";
import { db } from "../db";
import { images } from "../helpers/images.helpers";
import { auth } from "../middleware/auth";
import { Group } from "../utils/groups/interfaces";
import { groupReturnCode } from "../utils/groups/returnCodes";
import { MySQLResponse, JWTProps } from "../utils/interfaces";
import { Comment, Favorite, Place } from "../utils/places/interfaces";
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
      url,
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
          "INSERT INTO LunchPlaces (name, fk_country_speciality, lat, lng, rating, price_range, can_bring_reusable_contents, image, fk_lunch_group, fk_user, url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
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
            url,
          ]
        );
        if (place.affectedRows > 0) {
          const newPlace = await db.queryParams(
            "SELECT * FROM LunchPlaces WHERE id = ?",
            [place.insertId]
          );
          res.status(200).json(newPlace[0]);
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
      // Delete place from all favorites
      await db.queryParams(
        "DELETE FROM FavoriteLunchPlaces WHERE fk_lunch_place = ?",
        [id]
      );
      // Delete all comments from a place
      await db.queryParams(
        "DELETE FROM LunchPlacesComments WHERE fk_lunch_place = ?",
        [id]
      );
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

  // Add comment to place
  app.post(
    "/place/:id/comment",
    auth,
    async function (req: Request, res: Response) {
      // @ts-ignore
      const user: JWTProps = req.user;
      const { id } = req.params;
      const { comment } = req.body;
      if (!comment) {
        res.status(returnCode.missingParameters.code).json({
          payload: returnCode.missingParameters.payload,
          body: req.body,
        });
      } else {
        const place: Place[] = await db.queryParams(
          "SELECT * FROM LunchPlaces WHERE id = ?",
          [id]
        );
        if (place.length === 0) {
          res
            .status(placesReturnCode.placeNotFound.code)
            .json(placesReturnCode.placeNotFound.payload);
        } else {
          const insertComment: MySQLResponse = await db.queryParams(
            "INSERT INTO LunchPlacesComments (comment, fk_lunch_place, fk_user) VALUES (?, ?, ?)",
            [comment, id, user.id]
          );
          if (insertComment.affectedRows > 0) {
            // Get the new comment
            const newComment: Comment[] = await db.queryParams(
              "SELECT * FROM LunchPlacesComments WHERE id = ?",
              [insertComment.insertId]
            );
            res.status(201).json(newComment[0]);
          } else {
            res
              .status(returnCode.internalError.code)
              .json(returnCode.internalError.payload);
          }
        }
      }
    }
  );

  // Get all comments from a place
  app.get(
    "/place/:id/comments",
    auth,
    async function (req: Request, res: Response) {
      // @ts-ignore
      const user: JWTProps = req.user;
      const { id } = req.params;
      const place: Place[] = await db.queryParams(
        "SELECT * FROM LunchPlaces WHERE id = ?",
        [id]
      );
      if (place.length === 0) {
        res
          .status(placesReturnCode.placeNotFound.code)
          .json(placesReturnCode.placeNotFound.payload);
      } else {
        const comments: Comment[] = await db.queryParams(
          "SELECT * FROM LunchPlacesComments WHERE fk_lunch_place = ?",
          [id]
        );
        res.status(200).json(comments);
      }
    }
  );

  // Delete comment from place
  app.delete(
    "/place/:id/comment/:comment_id",
    auth,
    async function (req: Request, res: Response) {
      // @ts-ignore
      const user: JWTProps = req.user;
      const { id, comment_id } = req.params;
      const place: Place[] = await db.queryParams(
        "SELECT * FROM LunchPlaces WHERE id = ?",
        [id]
      );
      if (place.length === 0) {
        res
          .status(placesReturnCode.placeNotFound.code)
          .json(placesReturnCode.placeNotFound.payload);
      } else {
        const comment: Comment[] = await db.queryParams(
          "SELECT * FROM LunchPlacesComments WHERE id = ?",
          [comment_id]
        );
        if (comment.length === 0) {
          res
            .status(placesReturnCode.commentNotFound.code)
            .json(placesReturnCode.commentNotFound.payload);
        } else {
          const deleteComment: MySQLResponse = await db.queryParams(
            "DELETE FROM LunchPlacesComments WHERE id = ?",
            [comment_id]
          );
          if (deleteComment.affectedRows > 0) {
            res
              .status(placesReturnCode.commentDeleted.code)
              .json(placesReturnCode.commentDeleted.payload);
          } else {
            res
              .status(returnCode.internalError.code)
              .json(returnCode.internalError.payload);
          }
        }
      }
    }
  );

  // Add favorite place
  app.post(
    "/place/:id/favorite",
    auth,
    async function (req: Request, res: Response) {
      // @ts-ignore
      const user: JWTProps = req.user;
      const { id } = req.params;
      const place: Place[] = await db.queryParams(
        "SELECT * FROM LunchPlaces WHERE id = ?",
        [id]
      );
      if (place.length === 0) {
        res
          .status(placesReturnCode.placeNotFound.code)
          .json(placesReturnCode.placeNotFound.payload);
      } else {
        // Check if the place is already in favorite
        const favorite: Favorite[] = await db.queryParams(
          "SELECT * FROM FavoriteLunchPlaces WHERE fk_lunch_place = ? AND fk_user = ?",
          [id, user.id]
        );
        if (favorite.length === 0) {
          const insertFavorite: MySQLResponse = await db.queryParams(
            "INSERT INTO FavoriteLunchPlaces (fk_lunch_place, fk_user) VALUES (?, ?)",
            [id, user.id]
          );
          if (insertFavorite.affectedRows > 0) {
            res
              .status(placesReturnCode.placeFavorite.code)
              .json(placesReturnCode.placeFavorite.payload);
          } else {
            res
              .status(returnCode.internalError.code)
              .json(returnCode.internalError.payload);
          }
        } else {
          res
            .status(placesReturnCode.placeAlreadyFavorite.code)
            .json(placesReturnCode.placeAlreadyFavorite.payload);
        }
      }
    }
  );

  // Get all favorite places
  app.get(
    "/places/favorite",
    auth,
    async function (req: Request, res: Response) {
      // @ts-ignore
      const user: JWTProps = req.user;
      const favorite: Favorite[] = await db.queryParams(
        "SELECT * FROM FavoriteLunchPlaces WHERE fk_user = ?",
        [user.id]
      );
      res.status(200).json(favorite);
    }
  );

  // Delete favorite place
  app.delete(
    "/place/:id/favorite",
    auth,
    async function (req: Request, res: Response) {
      // @ts-ignore
      const user: JWTProps = req.user;
      const { id } = req.params;
      const place: Place[] = await db.queryParams(
        "SELECT * FROM LunchPlaces WHERE id = ?",
        [id]
      );
      if (place.length === 0) {
        res
          .status(placesReturnCode.placeNotFound.code)
          .json(placesReturnCode.placeNotFound.payload);
      } else {
        // Delete the favorite place
        const deleteFavorite: MySQLResponse = await db.queryParams(
          "DELETE FROM FavoriteLunchPlaces WHERE fk_lunch_place = ? AND fk_user = ?",
          [id, user.id]
        );
        if (deleteFavorite.affectedRows > 0) {
          res
            .status(placesReturnCode.placeUnfavorite.code)
            .json(placesReturnCode.placeUnfavorite.payload);
        } else {
          res
            .status(returnCode.internalError.code)
            .json(returnCode.internalError.payload);
        }
      }
    }
  );
};

export default places;
