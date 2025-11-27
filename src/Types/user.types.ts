export interface User {
  UserID: number;
  Username: string;
  Email: string;
  PasswordHash: string;
  Role: string;
  CreatedAt: Date;
}

export interface CreateUser {
  Username: string;
  Email: string;
  PasswordHash: string;
  Role?: string;
}

export interface UpdateUser {
  Username?: string;
  Email?: string;
  PasswordHash?: string;
  Role?: string;
}
