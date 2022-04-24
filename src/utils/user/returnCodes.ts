export const userReturnCode = {
  unknownUser: {
    code: 404,
    payload: {
      title: "unknown_user",
      message:
        "Unknown user! The user you trying to get insn't present in the database.",
    },
  },
  userAlreadyExists: {
    code: 400,
    payload: {
      title: "user_already_exists",
      message: "User already exists!",
    },
  },
  wrongPassword: {
    code: 400,
    payload: {
      title: "wrong_password",
      message: "Password missmatch!",
    },
  },
};
