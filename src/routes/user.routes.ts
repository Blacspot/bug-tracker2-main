import type { Express } from "express";
import * as userController from "../controllers/user.controller";
import { authenticateJWT } from "../middleware/auth.middleware";

const userRoutes = (app:Express) => {
    // GET /users - Get all users
    app.get('/users', userController.getAllUsersController);

    // POST /users/register - Create a new user
    app.post('/users/register', userController.createUserController);

    // POST /users/login - Login user
    app.post('/users/login', userController.loginUserController);

    // GET /users/profile - Get current user profile
    app.get('/users/profile', authenticateJWT, userController.getUserProfileController);

    // PUT /users/profile - Update user profile
    app.put('/users/profile', userController.updateUserProfileController);

    // PUT /users/change-password - Change password
    app.put('/users/change-password', authenticateJWT, userController.updateUserPasswordController);

    // DELETE /users/:id - Delete user
    app.delete('/users/:id', userController.deleteUserController);
}

export default userRoutes;