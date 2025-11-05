import { Request, Response, NextFunction } from "express";

export const setEmailType = (type: boolean) => {
  return (req: Request, res: Response, next: NextFunction) => {
    (req as any).email_type = type;
    next();
  };
};
