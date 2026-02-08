export class SessionExpiredError extends Error {
  code = "SESSION_EXPIRED";
  constructor(message = "SESSION_EXPIRED") {
    super(message);
  }
}

export const isSessionExpiredError = (error: any) => {
  if (!error) return false;
  if (error.code === "SESSION_EXPIRED") return true;
  if (error.message === "SESSION_EXPIRED") return true;
  if (error.response?.status === 401) return true;
  return false;
};
