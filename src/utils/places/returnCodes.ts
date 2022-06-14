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
  commentNotFound: {
    code: 404,
    payload: {
      title: "comment_not_found",
      message: "Can't find this comment in the database!",
    },
  },
  commentDeleted: {
    code: 200,
    payload: {
      title: "comment_deleted",
      message: "Comment deleted successfully!",
    },
  },
  placeFavorite: {
    code: 200,
    payload: {
      title: "place_favorite",
      message: "Place added to favorites successfully!",
    },
  },
  placeAlreadyFavorite: {
    code: 400,
    payload: {
      title: "place_already_favorite",
      message: "Place already in favorites!",
    },
  },
  placeUnfavorite: {
    code: 200,
    payload: {
      title: "place_unfavorite",
      message: "Place removed from favorites successfully!",
    },
  },
};
