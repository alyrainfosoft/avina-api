import { Router } from "express";
import authRoute from "./auth.route";
import publicRoute from "./public.route";
export default () => {
  const app = Router(); 
  authRoute(app);
  publicRoute(app);
  return app;
};
