export const groupReturnCode = {
  unknowngroup: {
    code: 404,
    payload: {
      title: "unknown_group",
      message:
        "Unknown group! The group you trying to get insn't present in the database.",
    },
  },
  groupAlreadyExists: {
    code: 400,
    payload: {
      title: "group_already_exists",
      message: "You already created a group, you can't create more than one!",
    },
  },
  groupNotFound: {
    code: 404,
    payload: {
      title: "group_not_found",
      message: "No group found for this group key!",
    },
  },
  notInGroup: {
    code: 404,
    payload: {
      title: "not_in_group",
      message: "No group found for this user!",
    },
  },
  alreadyInGroup: {
    code: 404,
    payload: {
      title: "already_in_group",
      message: "You are already in a group!",
    },
  },
  groupLeaved: {
    code: 200,
    payload: {
      title: "group_leaved",
      message: "You leaved the group successfully!",
    },
  },
  groupDeleted: {
    code: 200,
    payload: {
      title: "group_deleted",
      message: "You deleted the group successfully!",
    },
  },
};
