import { getPool } from '../../db/config';
import { User, CreateUser, UpdateUser } from '../Types/user.types';
import * as sql from 'mssql';

export class UserRepository {
  // Get all users
  static async getAllUsers(): Promise<User[]> {
    try {
      const pool: sql.ConnectionPool = await getPool();
      const result = await pool.request().query('SELECT * FROM Users ORDER BY CreatedAt DESC');
      return result.recordset;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }

  // Get user by ID
  static async getUserById(userId: number): Promise<User | null> {
    try {
      const pool: sql.ConnectionPool = await getPool();
      const result = await pool.request()
        .input('userId', userId)
        .query('SELECT * FROM Users WHERE UserID = @userId');
      return result.recordset[0] || null;
    } catch (error) {
      console.error('Error fetching user by ID:', error);
      throw error;
    }
  }

  // Get user by email (case insensitive)
  static async getUserByEmail(email: string): Promise<User | null> {
    try {
      const pool: sql.ConnectionPool = await getPool();
      const result = await pool.request()
        .input('email', email.toLowerCase())
        .query('SELECT * FROM Users WHERE LOWER(Email) = LOWER(@email)');
      return result.recordset[0] || null;
    } catch (error) {
      console.error('Error fetching user by email:', error);
      throw error;
    }
  }

  // Create new user
  static async createUser(userData: CreateUser): Promise<User> {
    try {
      const pool: sql.ConnectionPool = await getPool();
      const result = await pool.request()
        .input('username', userData.Username)
        .input('email', userData.Email)
        .input('passwordHash', userData.PasswordHash)
        .input('role', userData.Role || 'User')
        .input('isVerified', 1)
        .query('INSERT INTO Users (Username, Email, PasswordHash, Role, IsVerified) OUTPUT INSERTED.* VALUES (@username, @email, @passwordHash, @role, @isVerified)');
      return result.recordset[0];
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  // Update user
  static async updateUser(userId: number, userData: UpdateUser): Promise<User | null> {
    try {
      const updateFields: string[] = [];
      let paramIndex = 1;

      const request = (await getPool()).request();

      if (userData.Username) {
        updateFields.push(`Username = @p${paramIndex}`);
        request.input(`p${paramIndex++}`, userData.Username);
      }
      if (userData.Email) {
        updateFields.push(`Email = @p${paramIndex}`);
        request.input(`p${paramIndex++}`, userData.Email);
      }
      if (userData.PasswordHash) {
        updateFields.push(`PasswordHash = @p${paramIndex}`);
        request.input(`p${paramIndex++}`, userData.PasswordHash);
      }
      if (userData.Role) {
        updateFields.push(`Role = @p${paramIndex}`);
        request.input(`p${paramIndex++}`, userData.Role);
      }

      if (updateFields.length === 0) {
        throw new Error('No fields to update');
      }

      request.input(`p${paramIndex}`, userId);

      const query = `
        UPDATE Users
        SET ${updateFields.join(', ')}
        OUTPUT INSERTED.*
        WHERE UserID = @p${paramIndex}
      `;

      const result = await request.query(query);
      return result.recordset[0] || null;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  // Verify user code
  static async verifyUserCode(email: string, code: string): Promise<boolean> {
    try {
      const user = await this.getUserByEmail(email);
      if (!user || user.VerificationCode !== code || !user.CodeExpiry || new Date(user.CodeExpiry) < new Date()) {
        return false;
      }
      const pool: sql.ConnectionPool = await getPool();
      await pool.request()
        .input('email', email.toLowerCase())
        .query('UPDATE Users SET IsVerified = 1, VerificationCode = NULL, CodeExpiry = NULL WHERE LOWER(Email) = LOWER(@email)');
      return true;
    } catch (error) {
      console.error('Error verifying user code:', error);
      throw error;
    }
  }

  // Resend verification code
  static async resendVerificationCode(email: string): Promise<{code: string, expiry: Date}> {
    try {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const expiry = new Date(Date.now() + 24 * 60 * 60 * 1000);
      const pool: sql.ConnectionPool = await getPool();
      await pool.request()
        .input('email', email.toLowerCase())
        .input('code', code)
        .input('expiry', expiry)
        .query('UPDATE Users SET VerificationCode = @code, CodeExpiry = @expiry WHERE LOWER(Email) = LOWER(@email)');
      return { code, expiry };
    } catch (error) {
      console.error('Error resending verification code:', error);
      throw error;
    }
  }

  // Delete user
  static async deleteUser(userId: number): Promise<boolean> {
    try {
      const pool: sql.ConnectionPool = await getPool();
      const result = await pool.request()
        .input('userId', userId)
        .query('DELETE FROM Users WHERE UserID = @userId');
      return result.rowsAffected[0] > 0;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }
}