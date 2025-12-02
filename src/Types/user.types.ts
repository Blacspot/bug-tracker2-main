export interface User {
  UserID: number;
  Username: string;
  Email: string;
  PasswordHash: string;
  Role: string;
  CreatedAt: Date;
  IsVerified?: boolean;
  VerificationCode?: string;
  CodeExpiry?: Date;
}

export interface CreateUser {
  Username: string;
  Email: string;
  PasswordHash: string;
  Role?: string;
  IsVerified?: boolean;
  VerificationCode?: string;
  CodeExpiry?: Date;
}

export interface UpdateUser {
  Username?: string;
  Email?: string;
  PasswordHash?: string;
  Role?: string;
  IsVerified?: boolean;
  VerificationCode?: string;
  CodeExpiry?: Date;
}
