import { UserRepository } from '../../src/repositories/user.repositories';
import * as UserServices from '../../src/services/user.services';
import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';


jest.mock('../../src/repositories/user.repositories.ts');
jest.mock("bcrypt");
jest.mock("jsonwebtoken");
jest.mock("express");
jest.mock("pg");

describe("User service testing", () => {
  
   // Tests for successful user functions.
   it("should return a list of all users", async () =>{
    const mockUsers: any  = [
    {
     UserID:1,
     Username: "john doe",
     Email: "johndoe@gmail.com",
     PasswordHash: '1234trrfdgfsesfchfhgjghguyfytrdrsrs',
     Role: 'admin',
     CreatedAt: new Date("2025-10-30T14:30:00Z")
    }
    ,{
     UserID:2,
     Username: "jane002",
     Email: "jane002@gmail.com",
     PasswordHash:"jnkjdnfjksdnfkjaedjkhaekjfhkjdjkfnejkfnjkbdfv",
     Role:"user",
     CreatedAt: new Date("2025-11-30T15:30:00Z"),
    }
    ,{
     UserID:3,
     Username:"Alice",
     Email:"alice@gmail.com",
     PasswordHash:"jkbdkjfjdfckijhsdkjf",
     Role:"admin",
     CreatedAt:new Date("2025-10-30T14:30:00Z")
    },
    {
     UserID:4,
     Username:"Swiss001",
     Email:"Swiss001@gmail.com",
     PasswordHash:"hjsdnfkjekjkjjkbkjdcjjhdsc123445",
     Role:"admin",
     CreatedAt:new Date()
    }];
    (UserRepository.getAllUsers as jest.Mock).mockResolvedValue(mockUsers)
    
   });

   it("should create a user", async () =>{
     const inputData = {
      username:"Paul",
      email:"paulmuyalikhams@gmail.com",
      password:"password123"
     };
     const mockUser = {
      UserID: 1,
      Username:"Paul",
      Email:"paulmuyalikhams@gmail.com",
      PasswordHash:"hashedpassword",
      Role:"admin",
      CreatedAt: new Date()
     };
     (UserRepository.getUserByEmail as jest.Mock).mockResolvedValue(null);
     (UserRepository.createUser as jest.Mock).mockResolvedValue(mockUser);
     (bcrypt.hash as jest.Mock).mockResolvedValue("hashedpassword");

     const result = await UserServices.createUser(inputData);

     expect(result).toEqual({
       UserID: 1,
       Username: "Paul",
       Email: "paulmuyalikhams@gmail.com",
       Role: "admin",
       CreatedAt: mockUser.CreatedAt
     });
   });
   it("should reject a user who has not filled credentials when creating", async() => {
     const mockUser =
     {
      Username:"Paul",
      Email:"paulmuyalikhams@gmail.com",

      Role:"admin"
     };

     await expect(UserServices.createUser(mockUser)).rejects.toThrow("Missing credentials, please fully fill credentials required");
    });

    const mockUserForLogin = {
      UserID:1,
      Username: "john doe",
      Email: "johndoe@gmail.com",
      PasswordHash: '1234trrfdgfsesfchfhgjghguyfytrdrsrs',
      Role: 'admin',
      CreatedAt: new Date("2025-10-30T14:30:00Z")
    };

     //login test.
     it("should login a user successfully", async () => {

      (UserRepository.getUserByEmail as jest.Mock).mockResolvedValue(mockUserForLogin);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwt.sign as jest.Mock).mockReturnValue('mockToken');

      const result = await UserServices.loginUser(mockUserForLogin.Email, mockUserForLogin.PasswordHash);

      expect(result).toEqual({
        token: 'mockToken',
        user: {
          UserID: mockUserForLogin.UserID,
          Username: mockUserForLogin.Username,
          Email: mockUserForLogin.Email,
          Role: mockUserForLogin.Role,
          CreatedAt: mockUserForLogin.CreatedAt
        }
      });
    });


  const mockUserForProfile = {
    UserID:1,
    Username: "john doe",
    Email: "johndoe@gmail.com",
    PasswordHash: '1234trrfdgfsesfchfhgjghguyfytrdrsrs',
    Role: 'admin',
    CreatedAt: new Date("2025-10-30T14:30:00Z")
  };

  it("should get a user's profile", async() => {
    (UserRepository.getUserById as jest.Mock).mockResolvedValue(mockUserForProfile);

    const result = await UserServices.getUserProfile(mockUserForProfile.UserID);

    expect(result).toEqual({
      UserID: mockUserForProfile.UserID,
      Username: mockUserForProfile.Username,
      Email: mockUserForProfile.Email,
      Role: mockUserForProfile.Role,
      CreatedAt: mockUserForProfile.CreatedAt
    });
  });

  it("should update a user's credentials", async()=>{
    const mockUser={
        UserID:1,
        Username: "john doe",
        Email: "johndoe@gmail.com",
        PasswordHash: '1234trrfdgfsesfchfhgjghguyfytrdrsrs',
        Role: 'admin',
        CreatedAt: new Date("2025-10-30T14:30:00Z")
      }
      const updateData={
        Username:"Paul-Muyali",
        Email:"paulmuyalikhams@gmail.com"
      }

      const updatedUser = {
        ...mockUser,
        Username: updateData.Username,
        Email: updateData.Email
      };

      (UserRepository.getUserById as jest.Mock).mockResolvedValue(mockUser); // for ensureUserexists
      (UserRepository.updateUser as jest.Mock).mockResolvedValue(updatedUser);
      (UserRepository.getUserByEmail as jest.Mock).mockResolvedValue(null); // No conflict

      const result = await UserServices.updateUserProfile(mockUser.UserID, updateData);

      expect(UserRepository.updateUser).toHaveBeenCalledWith(mockUser.UserID, updateData);
      expect(result).toEqual({
       UserID: updatedUser.UserID,
       Username: updatedUser.Username,
       Email: updatedUser.Email,
       Role: updatedUser.Role,
       CreatedAt: updatedUser.CreatedAt
      })
});
    
it("should update the user's password", async() => {
  const mockUser={
  UserID:1,
  Username: "john doe",
  Email: "johndoe@gmail.com",
  PasswordHash: '1234trrfdgfsesfchfhgjghguyfytrdrsrs',
  Role: 'admin',
  CreatedAt: new Date("2025-10-30T14:30:00Z")
  };

  (UserRepository.getUserById as jest.Mock).mockResolvedValue(mockUser);
  (bcrypt.compare as jest.Mock).mockResolvedValue(true);
  (UserRepository.updateUser as jest.Mock).mockResolvedValue(null);
  (bcrypt.hash as jest.Mock).mockResolvedValue('$2b$10$mockHashedPassword');

  await UserServices.updateUserPassword(mockUser.UserID, '1234trrfdgfsesfchfhgjghguyfytrdrsrs', '12345678djd');

  expect(UserRepository.updateUser).toHaveBeenCalledWith(mockUser.UserID, {
    PasswordHash: '$2b$10$mockHashedPassword'
  });
});




    // Additional fail tests for edge cases

    it("should fail to login with invalid email", async () => {
      (UserRepository.getUserByEmail as jest.Mock).mockResolvedValue(null);

      await expect(UserServices.loginUser("invalid@example.com", "password123")).rejects.toThrow("Invalid email or password");
    });

    it("should fail to login with incorrect password", async () => {
      const mockUser = {
        UserID: 1,
        Username: "john doe",
        Email: "johndoe@gmail.com",
        PasswordHash: 'hashedpassword',
        Role: 'admin',
        CreatedAt: new Date("2025-10-30T14:30:00Z")
      };

      (UserRepository.getUserByEmail as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(UserServices.loginUser(mockUser.Email, "wrongpassword")).rejects.toThrow("Invalid email or password");
    });

    it("should fail to get user profile when user not found", async () => {
      (UserRepository.getUserById as jest.Mock).mockResolvedValue(null);

      await expect(UserServices.getUserProfile(999)).rejects.toThrow("User not found");
    });

    it("should fail to update user profile with invalid email", async () => {
      const mockUser = {
        UserID: 1,
        Username: "john doe",
        Email: "johndoe@gmail.com",
        PasswordHash: 'hashedpassword',
        Role: 'admin',
        CreatedAt: new Date("2025-10-30T14:30:00Z")
      };

      (UserRepository.getUserById as jest.Mock).mockResolvedValue(mockUser);

      await expect(UserServices.updateUserProfile(mockUser.UserID, { Email: "invalid" })).rejects.toThrow("Invalid email format");
    });

    it("should fail to update user profile with no valid fields", async () => {
      const mockUser = {
        UserID: 1,
        Username: "john doe",
        Email: "johndoe@gmail.com",
        PasswordHash: 'hashedpassword',
        Role: 'admin',
        CreatedAt: new Date("2025-10-30T14:30:00Z")
      };

      (UserRepository.getUserById as jest.Mock).mockResolvedValue(mockUser);

      await expect(UserServices.updateUserProfile(mockUser.UserID, { invalidField: "value" } as any)).rejects.toThrow("No valid fields to update");
    });

    it("should fail to update user profile when email is already taken", async () => {
      const mockUser = {
        UserID: 1,
        Username: "john doe",
        Email: "johndoe@gmail.com",
        PasswordHash: 'hashedpassword',
        Role: 'admin',
        CreatedAt: new Date("2025-10-30T14:30:00Z")
      };

      (UserRepository.getUserById as jest.Mock).mockResolvedValue(mockUser);
      (UserRepository.getUserByEmail as jest.Mock).mockResolvedValue({ ...mockUser, UserID: 2 }); // Different user

      await expect(UserServices.updateUserProfile(mockUser.UserID, { Email: "taken@example.com" })).rejects.toThrow("Email is already taken");
    });

    it("should fail to update user profile when user not found", async () => {
      (UserRepository.getUserById as jest.Mock).mockResolvedValue(null);

      await expect(UserServices.updateUserProfile(999, { Username: "newname" })).rejects.toThrow("User not found");
    });

    it("should fail to update password with missing fields", async () => {
      const mockUser = {
        UserID: 1,
        Username: "john doe",
        Email: "johndoe@gmail.com",
        PasswordHash: 'hashedpassword',
        Role: 'admin',
        CreatedAt: new Date("2025-10-30T14:30:00Z")
      };

      (UserRepository.getUserById as jest.Mock).mockResolvedValue(mockUser);

      await expect(UserServices.updateUserPassword(mockUser.UserID, "", "new12345678")).rejects.toThrow("Current password and new password are required");
    });

    it("should fail to update password with short new password", async () => {
      const mockUser = {
        UserID: 1,
        Username: "john doe",
        Email: "johndoe@gmail.com",
        PasswordHash: 'hashedpassword',
        Role: 'admin',
        CreatedAt: new Date("2025-10-30T14:30:00Z")
      };

      (UserRepository.getUserById as jest.Mock).mockResolvedValue(mockUser);

      await expect(UserServices.updateUserPassword(mockUser.UserID, "old", "short")).rejects.toThrow("New password must be at least 8 characters");
    });

    it("should fail to update password when user not found", async () => {
      (UserRepository.getUserById as jest.Mock).mockResolvedValue(null);

      await expect(UserServices.updateUserPassword(999, "old", "new12345678")).rejects.toThrow("User not found");
    });

    it("should fail to update password with incorrect current password", async () => {
      const mockUser = {
        UserID: 1,
        Username: "john doe",
        Email: "johndoe@gmail.com",
        PasswordHash: 'hashedpassword',
        Role: 'admin',
        CreatedAt: new Date("2025-10-30T14:30:00Z")
      };

      (UserRepository.getUserById as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(UserServices.updateUserPassword(mockUser.UserID, "wrong", "new12345678")).rejects.toThrow("Current password is incorrect");
    });

    it("should fail to update password on database error", async () => {
      const mockUser = {
        UserID: 1,
        Username: "john doe",
        Email: "johndoe@gmail.com",
        PasswordHash: 'hashedpassword',
        Role: 'admin',
        CreatedAt: new Date("2025-10-30T14:30:00Z")
      };

      (UserRepository.getUserById as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (UserRepository.updateUser as jest.Mock).mockRejectedValue(new Error("Database error"));

      await expect(UserServices.updateUserPassword(mockUser.UserID, "old", "new12345678")).rejects.toThrow("Database error");
    });
})
