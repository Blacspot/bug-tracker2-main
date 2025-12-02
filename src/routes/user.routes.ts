import type { Express } from "express";
import * as userController from "../controllers/user.controller";
import { authenticateToken } from "../middleware/auth.middleware";

const userRoutes = (app:Express) => {
    // GET /users - Get all users
    app.get('/users', userController.getAllUsersController);

    // POST /users/register - Create a new user
    app.post('/users/register', userController.createUserController);

    // POST /users/login - Login user
    app.post('/users/login', userController.loginUserController);

    // GET /users/profile - Get current user profile
    app.get('/users/profile', authenticateToken, userController.getUserProfileController);

    // PUT /users/profile - Update user profile
    app.put('/users/profile', userController.updateUserProfileController);

    // PUT /users/change-password - Change password
    app.put('/users/change-password', authenticateToken, userController.updateUserPasswordController);

    // DELETE /users/:id - Delete user
    app.delete('/users/:id', userController.deleteUserController);

    // POST /users/resend-verification - Resend verification email
    app.post('/users/resend-verification', userController.resendVerificationEmailController);

    // POST /users/verify-email - Verify email
    app.post('/users/verify-email', userController.verifyEmailController);
}

export default userRoutes;