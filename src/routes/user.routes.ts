import type { Express } from "express";
import * as userController from "../controllers/user.controller";
import { authenticateJWT } from "../middleware/auth.middleware";
import { authorizeRole } from "../middleware/role.middleware";

const userRoutes = (app:Express) => {
    // GET /users - Get all users (Admin only)
    app.get('/users', authenticateJWT, authorizeRole('admin'), userController.getAllUsersController);

    // POST /users/register - Create a new user
    app.post('/users/register', userController.createUserController);

    // POST /users/login - Login user
    app.post('/users/login', userController.loginUserController);

    // GET /users/profile - Get current user profile
    app.get('/users/profile', authenticateJWT, userController.getUserProfileController);

    // PUT /users/profile/:UserID - Update user profile
    app.put('/users/profile/:UserID', userController.updateUserProfileController);

    // PUT /users/change-password - Change password
    app.put('/users/change-password', authenticateJWT, userController.updateUserPasswordController);

    // DELETE /users/:id - Delete user (Admin only)
    app.delete('/users/:id', authenticateJWT, authorizeRole('admin'), userController.deleteUserController);
}

export default userRoutes;