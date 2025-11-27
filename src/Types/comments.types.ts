export interface Comment {
  CommentID: number;
  BugID: number;
  UserID: number;
  CommentText: string;
  CreatedAt: Date;
}

export interface CreateComment {
  BugID: number;
  UserID: number;
  CommentText: string;
}

export interface UpdateComment {
  CommentText?: string;
}