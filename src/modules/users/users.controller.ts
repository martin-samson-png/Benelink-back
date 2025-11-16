import { NextFunction, Request, Response } from "express";
import { UsersService } from "./users.service";

export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  async getUserById(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.params.id;
      const user = await this.usersService.getUserById(userId);
      res.status(200).json(user);
    } catch (err) {
      next(err);
    }
  }

  async getAllUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const users = await this.usersService.getAllUsers();
      res.status(200).json(users);
    } catch (err) {
      next(err);
    }
  }

  async createUser(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await this.usersService.createUser(req.body);
      res.status(201).json(user);
    } catch (err) {
      next(err);
    }
  }

  async updatePassword(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { password, oldPassword } = req.body;
      const user = await this.usersService.updatePassword({
        userId,
        oldPassword,
        password,
      });
      res.status(200).json(user);
    } catch (err) {
      next(err);
    }
  }

  async updateFields(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const data = { userId, ...req.body };
      const user = await this.usersService.updateFields(data);
      res.status(200).json(user);
    } catch (err) {
      next(err);
    }
  }

  async deleteUserById(req: Request, res: Response, next: NextFunction) {
    try {
      const { password } = req.body;
      const userId = req.user!.id;
      const data = { userId, password };
      await this.usersService.deleteUserById(data);
      res.cookie("token", "", {
        httpOnly: true,
        sameSite: "lax",
        secure: true,
        expires: new Date(0),
      });
      res.status(204).end();
    } catch (err) {
      next(err);
    }
  }
}
