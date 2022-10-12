export const eventsReturnCodes = {
  created: {
    code: 201,
    payload: {
      title: "event_created",
      message: "Event created successfully!",
    },
  },
  createdFailed: {
    code: 500,
    payload: {
      title: "event_created_failed",
      message: "Event creation failed!",
    },
  },
  deleteSuccess: {
    code: 200,
    payload: {
      title: "event_deleted",
      message: "Event deleted successfully!",
    },
  },
  deleteFailed: {
    code: 500,
    payload: {
      title: "event_delete_failed",
      message: "Event deletion failed!",
    },
  },
  joinSuccess: {
    code: 201,
    payload: {
      title: "event_joined",
      message: "Event joined successfully!",
    },
  },
  joinFailed: {
    code: 400,
    payload: {
      title: "join_failed",
      message: "Failed to join event!",
    },
  },
  leaveSuccess: {
    code: 200,
    payload: {
      title: "event_left",
      message: "Event left successfully!",
    },
  },
  leaveFailed: {
    code: 400,
    payload: {
      title: "leave_failed",
      message: "Failed to leave event!",
    },
  },
};
