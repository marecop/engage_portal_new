import "express-session";

declare module "express-session" {
  interface SessionData {
    authCookies?: string;
    pupilId?: string;
  }
}
