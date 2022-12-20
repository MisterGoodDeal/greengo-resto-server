import { Request, Response } from "express";
import { db } from "../db";
import { images } from "../helpers/images.helpers";
import { auth } from "../middleware/auth";
import { notification } from "../services/fcm.service";
import { geoapify, RoutePlannerResponse } from "../services/geoapify.service";
import { Group, UserGroupAssociation } from "../utils/groups/interfaces";
import { groupReturnCode } from "../utils/groups/returnCodes";
import { MySQLResponse, JWTProps } from "../utils/interfaces";
import {
  Comment,
  Favorite,
  Place,
  Speciality,
  StuffedPlace,
} from "../utils/places/interfaces";
import { placesReturnCode } from "../utils/places/returnCodes";
import { Rating } from "../utils/ratings/interfaces";
import { returnCode } from "../utils/returnCodes";
import { User } from "../utils/user/interfaces";

const places = (app: any) => {
  // Create place
  app.post("/place/create", auth, async function (req: Request, res: Response) {
    // @ts-ignore
    const user: JWTProps = req.user;
    const {
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
      typeof country_speciality !== "number" ||
      !lat ||
      !lng ||
      !name ||
      !rating ||
      !price_range ||
      typeof can_bring_reusable_content !== "boolean"
    ) {
      res.status(returnCode.missingParameters.code).json({
        payload: returnCode.missingParameters.payload,
        parameters: {
          country_speciality: typeof country_speciality !== "number",
          lat: !lat,
          lng: !lng,
          name: !name,
          rating: !rating,
          price_range: !price_range,
          can_bring_reusable_content: typeof can_bring_reusable_content,
        },
      });
    } else {
      // Get the group from the user
      const groupAssoc: UserGroupAssociation[] = await db.queryParams(
        `SELECT * FROM UsersLauchGroupsAssoc WHERE fk_user = ?`,
        [user.id]
      );
      groupAssoc.length === 0 ? (groupAssoc[0].fk_lunch_group = -1) : null;

      // Check if the group exists
      const group: Group[] = await db.queryParams(
        "SELECT * FROM LunchGroups WHERE id = ?",
        [groupAssoc[0].fk_lunch_group]
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
          "INSERT INTO LunchPlaces (name, fk_country_speciality, lat, lng,  price_range, can_bring_reusable_contents, image, fk_lunch_group, fk_user, url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
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
          const newPlace: Place[] = await db.queryParams(
            "SELECT * FROM LunchPlaces WHERE id = ?",
            [place.insertId]
          );
          // Send notification when new place is added
          const usersGroupsAssoc: { fk_user: number }[] = await db.queryParams(
            "SELECT * FROM UsersLauchGroupsAssoc WHERE fk_lunch_group = ?",
            [groupAssoc[0].fk_lunch_group]
          );

          // Send notification to all users in the group
          usersGroupsAssoc.forEach(async (assoc) => {
            const notificationsDb = await notification.getTokens(assoc.fk_user);
            notificationsDb.map((ndb) => {
              const eventNotification = generateAddPlaceNotification({
                lang: ndb.lang,
                firstname: user.firstname,
                restaurantName: newPlace[0].name,
              });
              notification.send([ndb.token], {
                title: eventNotification.title,
                body: eventNotification.body,
                extra: JSON.stringify({
                  type: "new_place",
                  creator: {
                    id: user.id,
                    firstname: user.firstname,
                    lastname: user.lastname,
                  },
                  place: {
                    id: newPlace[0].id,
                    name: newPlace[0].name,
                    lat: newPlace[0].lat,
                    lng: newPlace[0].lng,
                  },
                }),
              });
            });
          });

          res.status(200).json(newPlace[0]);
        }
      }
    }
  });

  // Get all places from a group
  app.get("/places/all", auth, async function (req: Request, res: Response) {
    // @ts-ignore
    const user: JWTProps = req.user;

    const groupAssoc: UserGroupAssociation[] = await db.queryParams(
      "SELECT * FROM UsersLauchGroupsAssoc WHERE fk_user = ?",
      [user.id]
    );

    const group: Group[] = await db.queryParams(
      "SELECT * FROM LunchGroups WHERE id = ?",
      [groupAssoc[0].fk_lunch_group]
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
      const stuffedPlaces: StuffedPlace[] = [];
      Promise.all(
        places.map(async (place: Place) => {
          const comments: Comment[] = await db.queryParams(
            "SELECT * FROM LunchPlacesComments WHERE fk_lunch_place = ?",
            [place.id]
          );
          const averageRating = await db.queryParams(
            "SELECT AVG(rating) as rating FROM LunchPlaceRatings WHERE place = ?",
            [place.id]
          );
          const partialComments: Partial<Comment> & Partial<User>[] = [];
          await Promise.all(
            comments.map(async (comment: Comment) => {
              const user: User[] = await db.queryParams(
                "SELECT * FROM Users WHERE id = ?",
                [comment.fk_user]
              );
              const partialComment = {
                id: comment.id,
                comment: comment.comment,
                created_at: new Date(comment.created_at),
                firstname: user[0].firstname,
                lastname: user[0].lastname,
                profile_picture: user[0].profile_picture,
              };
              partialComments.push(partialComment);
            })
          ).then(() => {
            const stuffedPlace: StuffedPlace = {
              ...place,
              rating: averageRating,
              comments: partialComments,
            };
            stuffedPlaces.push(stuffedPlace);
          });
        })
      ).then(() => {
        res.status(200).json(stuffedPlaces);
      });
    }
  });

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

  // Route planner to place
  app.post(
    "/place/:id/route",
    auth,
    async function (req: Request, res: Response) {
      const { id } = req.params;
      const { startLat, startLng } = req.body;
      const user = req.body.user;
      console.log("Route planning request by ", user);

      const place: Place[] = await db.queryParams(
        "SELECT * FROM LunchPlaces WHERE id = ?",
        [id]
      );
      if (place.length === 0) {
        res
          .status(placesReturnCode.placeNotFound.code)
          .json(placesReturnCode.placeNotFound.payload);
      } else {
        const placeLat = place[0].lat;
        const placeLng = place[0].lng;
        try {
          const route = await geoapify.planner({
            startLat,
            startLng,
            endLat: placeLat,
            endLng: placeLng,
          });
          const coordinates = route.features[0].geometry.coordinates[0];
          const distance = route.features[0].properties.distance;
          const time = route.features[0].properties.time;
          const formattedCoordinates = coordinates.map(
            (coordinate: number[]) => {
              return {
                latitude: coordinate[1],
                longitude: coordinate[0],
              };
            }
          );
          const response: RoutePlannerResponse = {
            distance,
            time: Math.round(time / 60),
            polyline: formattedCoordinates,
          };
          res.status(200).json(response);
        } catch (error) {
          res.status(400).json({ error });
        }
      }
    }
  );
  
  app.post("/rating", auth, async function (req: Request, res: Response) {
    const { userId, restaurantId, rating } = req.body;
    try {
      const ratingById: Rating = await db.queryParams(
        "SELECT * FROM LunchPlaceRatings WHERE user = ?",
        [userId]
      );
      if (ratingById.id) {
        res
          .status(200)
          .json(`The user with id: ${userId} has already rate this place.`);
      } else {
        const response: MySQLResponse = await db.queryParams(
          "INSERT INTO LunchPlaceRatings (place, user, rating) VALUES (?, ?, ?)",
          [restaurantId, userId, rating]
        );
        if (response.affectedRows > 0) {
          res.status(200).json(response);
        }
      }
    } catch (error) {
      res.status(400).json({
        error,
      });
    }

  // Get specilities
  app.get("/specialties", auth, async function (req: Request, res: Response) {
    const specialties: Speciality[] = await db.query(
      "SELECT * FROM LunchPlaceSpecialities"
    );
    res.status(200).json(specialties);
  });
};

const generateAddPlaceNotification = (params: {
  lang: string;
  firstname: string;
  restaurantName: string;
}) => {
  switch (params.lang) {
    case "fr":
      return {
        title: `Nouveau restaurant 🍽️`,
        body: `${params.firstname} a ajouté le restaurant « ${params.restaurantName} »`,
      };
    case "en":
      return {
        title: `New restaurant 🍽️`,
        body: `${params.firstname} just added a new restaurant « ${params.restaurantName} » `,
      };
    default:
      return {
        title: `New restaurant 🍽️`,
        body: `${params.firstname} just added a new restaurant « ${params.restaurantName} »`,
      };
  }
};

export default places;
