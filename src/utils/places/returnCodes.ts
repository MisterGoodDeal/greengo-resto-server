export const placesReturnCode = {
  placeNotFound: {
    code: 404,
    payload: {
      title: "place_not_found",
      message: "Can't find this place in the database!",
    },
  },
  placeDeleted: {
    code: 200,
    payload: {
      title: "place_deleted",
      message: "Place deleted successfully!",
    },
  },
};
