

    describe("CommentRepository Mock", () => {
         test("comments can be retreived from the database", async () => {
            const mockComment ={
                            CommentID: 1,
                            BugID: 1,
                            UserID: 1,
                            CommentText: "This is a comment",
                            CreatedAt: new Date(),
                            UpdatedAt: new Date()
    };

        jest.spyOn(CommentRepository, "getCommentById").mockResolvedValueOnce(mockComment);

        const comments = await CommentRepository.getCommentById(1);

        expect(comments).toEqual(mockComment);

         });
    });

import { CommentRepository } from '../../src/repositories/comments.repositories';
import { BugRepository } from '../../src/repositories/bugs.repositories';
import { UserRepository } from '../../src/repositories/user.repositories';
import * as CommentServices from '../../src/services/comments.services';


jest.mock('../../src/repositories/comments.repositories.ts');
jest.mock('../../src/repositories/bugs.repositories.ts');
jest.mock('../../src/repositories/user.repositories.ts');

describe("Comment service testing", () => {

  // Tests for successful comment functions
  it("should return a list of all comments", async () => {
    const mockComments: any = [
      {
        CommentID: 1,
        BugID: 1,
        UserID: 1,
        CommentText: "This is a critical bug that needs immediate attention",
        CreatedAt: new Date("2025-10-30T14:30:00Z")
      },
      {
        CommentID: 2,
        BugID: 1,
        UserID: 2,
        CommentText: "I'm working on fixing this issue",
        CreatedAt: new Date("2025-10-31T10:15:00Z")
      },
      {
        CommentID: 3,
        BugID: 2,
        UserID: 1,
        CommentText: "This bug is related to the authentication module",
        CreatedAt: new Date("2025-11-01T09:00:00Z")
      }
    ];

    (CommentRepository.getAllComments as jest.Mock).mockResolvedValue(mockComments);

    const comments = await CommentServices.getAllComments();

    expect(comments).toEqual(mockComments);
    expect(CommentRepository.getAllComments).toHaveBeenCalled();
  });

  it("should get a comment by ID", async () => {
    const mockComment = {
      CommentID: 1,
      BugID: 1,
      UserID: 1,
      CommentText: "This is a critical bug that needs immediate attention",
      CreatedAt: new Date("2025-10-30T14:30:00Z")
    };

    (CommentRepository.getCommentById as jest.Mock).mockResolvedValue(mockComment);

    const comment = await CommentServices.getCommentById(1);

    expect(comment).toEqual(mockComment);
    expect(CommentRepository.getCommentById).toHaveBeenCalledWith(1);
  });

  it("should get comments by bug ID", async () => {
    const mockComments: any = [
      {
        CommentID: 1,
        BugID: 1,
        UserID: 1,
        CommentText: "This is a critical bug that needs immediate attention",
        CreatedAt: new Date("2025-10-30T14:30:00Z")
      },
      {
        CommentID: 2,
        BugID: 1,
        UserID: 2,
        CommentText: "I'm working on fixing this issue",
        CreatedAt: new Date("2025-10-31T10:15:00Z")
      }
    ];

    (CommentRepository.getCommentsByBug as jest.Mock).mockResolvedValue(mockComments);

    const comments = await CommentServices.getCommentsByBug(1);

    expect(comments).toEqual(mockComments);
    expect(CommentRepository.getCommentsByBug).toHaveBeenCalledWith(1);
  });

  it("should get comments by user ID", async () => {
    const mockComments: any = [
      {
        CommentID: 1,
        BugID: 1,
        UserID: 1,
        CommentText: "This is a critical bug that needs immediate attention",
        CreatedAt: new Date("2025-10-30T14:30:00Z")
      },
      {
        CommentID: 3,
        BugID: 2,
        UserID: 1,
        CommentText: "This bug is related to the authentication module",
        CreatedAt: new Date("2025-11-01T09:00:00Z")
      }
    ];

    (CommentRepository.getCommentsByUser as jest.Mock).mockResolvedValue(mockComments);

    const comments = await CommentServices.getCommentsByUser(1);

    expect(comments).toEqual(mockComments);
    expect(CommentRepository.getCommentsByUser).toHaveBeenCalledWith(1);
  });

  it("should create a comment successfully", async () => {
    const mockCommentData = {
      BugID: 1,
      UserID: 1,
      CommentText: "This is a new comment"
    };

    const mockCreatedComment = {
      CommentID: 1,
      ...mockCommentData,
      CreatedAt: new Date("2025-11-04T12:00:00Z")
    };

    const mockBug = {
      BugID: 1,
      Title: "Test Bug",
      Description: "Test Description",
      Status: "Open",
      Priority: "High",
      CreatedBy: 1,
      AssignedTo: null,
      CreatedAt: new Date(),
      UpdatedAt: new Date()
    };

    const mockUser = {
      UserID: 1,
      Username: "testuser",
      Email: "test@example.com",
      PasswordHash: "hashedpassword",
      Role: "user",
      CreatedAt: new Date()
    };

    (BugRepository.getBugById as jest.Mock).mockResolvedValue(mockBug);
    (UserRepository.getUserById as jest.Mock).mockResolvedValue(mockUser);
    (CommentRepository.createComment as jest.Mock).mockResolvedValue(mockCreatedComment);

    const comment = await CommentServices.createComment(mockCommentData);

    expect(comment).toEqual(mockCreatedComment);
    expect(BugRepository.getBugById).toHaveBeenCalledWith(1);
    expect(UserRepository.getUserById).toHaveBeenCalledWith(1);
    expect(CommentRepository.createComment).toHaveBeenCalledWith(mockCommentData);
  });

  it("should update a comment successfully", async () => {
    const mockUpdateData = {
      CommentText: "Updated comment text"
    };

    const mockUpdatedComment = {
      CommentID: 1,
      BugID: 1,
      UserID: 1,
      CommentText: "Updated comment text",
      CreatedAt: new Date("2025-10-30T14:30:00Z")
    };

    (CommentRepository.updateComment as jest.Mock).mockResolvedValue(mockUpdatedComment);

    const comment = await CommentServices.updateComment(1, mockUpdateData);

    expect(comment).toEqual(mockUpdatedComment);
    expect(CommentRepository.updateComment).toHaveBeenCalledWith(1, mockUpdateData);
  });

  it("should delete a comment successfully", async () => {
    (CommentRepository.deleteComment as jest.Mock).mockResolvedValue(true);

    const result = await CommentServices.deleteComment(1);

    expect(result).toBe(true);
    expect(CommentRepository.deleteComment).toHaveBeenCalledWith(1);
  });

  it("should delete all comments by bug ID", async () => {
    (CommentRepository.deleteCommentsByBug as jest.Mock).mockResolvedValue(5);

    const deletedCount = await CommentServices.deleteCommentsByBug(1);

    expect(deletedCount).toBe(5);
    expect(CommentRepository.deleteCommentsByBug).toHaveBeenCalledWith(1);
  });

  // Additional fail tests for edge cases
  it("should fail to get comment by ID with invalid ID", async () => {
    await expect(CommentServices.getCommentById(NaN)).rejects.toThrow('Invalid comment ID');
  });

  it("should fail to get comments by bug with invalid bug ID", async () => {
    await expect(CommentServices.getCommentsByBug(NaN)).rejects.toThrow('Invalid bug ID');
  });

  it("should fail to get comments by user with invalid user ID", async () => {
    await expect(CommentServices.getCommentsByUser(NaN)).rejects.toThrow('Invalid user ID');
  });

  it("should fail to create comment without data", async () => {
    await expect(CommentServices.createComment(null)).rejects.toThrow("Please provide comment data");
  });

  it("should fail to create comment with missing required fields", async () => {
    const incompleteData = {
      BugID: 1,
      UserID: 1
      // Missing CommentText
    };

    await expect(CommentServices.createComment(incompleteData)).rejects.toThrow(
      "Missing required fields: BugID, UserID, and CommentText are required"
    );
  });

  it("should fail to create comment with invalid field types", async () => {
    const invalidData = {
      BugID: "not a number",
      UserID: 1,
      CommentText: "Valid text"
    };

    await expect(CommentServices.createComment(invalidData)).rejects.toThrow(
      "Invalid field types: BugID and UserID must be numbers, CommentText must be string"
    );
  });

  it("should fail to create comment with empty comment text", async () => {
    const emptyTextData = {
      BugID: 1,
      UserID: 1,
      CommentText: "   "
    };

    const mockBug = {
      BugID: 1,
      Title: "Test Bug",
      Description: "Test Description",
      Status: "Open",
      Priority: "High",
      CreatedBy: 1,
      AssignedTo: null,
      CreatedAt: new Date(),
      UpdatedAt: new Date()
    };

    const mockUser = {
      UserID: 1,
      Username: "testuser",
      Email: "test@example.com",
      PasswordHash: "hashedpassword",
      Role: "user",
      CreatedAt: new Date()
    };

    (BugRepository.getBugById as jest.Mock).mockResolvedValue(mockBug);
    (UserRepository.getUserById as jest.Mock).mockResolvedValue(mockUser);

    await expect(CommentServices.createComment(emptyTextData)).rejects.toThrow(
      "CommentText cannot be empty"
    );
  });

  it("should fail to create comment with invalid bug ID", async () => {
    const invalidBugData = {
      BugID: 999,
      UserID: 1,
      CommentText: "Valid comment text"
    };

    (BugRepository.getBugById as jest.Mock).mockResolvedValue(null);

    await expect(CommentServices.createComment(invalidBugData)).rejects.toThrow(
      "Invalid BugID: Bug does not exist"
    );
  });

  it("should fail to create comment with invalid user ID", async () => {
    const invalidUserData = {
      BugID: 1,
      UserID: 999,
      CommentText: "Valid comment text"
    };

    const mockBug = {
      BugID: 1,
      Title: "Test Bug",
      Description: "Test Description",
      Status: "Open",
      Priority: "High",
      CreatedBy: 1,
      AssignedTo: null,
      CreatedAt: new Date(),
      UpdatedAt: new Date()
    };

    (BugRepository.getBugById as jest.Mock).mockResolvedValue(mockBug);
    (UserRepository.getUserById as jest.Mock).mockResolvedValue(null);

    await expect(CommentServices.createComment(invalidUserData)).rejects.toThrow(
      "Invalid UserID: User does not exist"
    );
  });

  it("should fail to update comment with invalid comment ID", async () => {
    const updateData = {
      CommentText: "Updated text"
    };

    await expect(CommentServices.updateComment(NaN, updateData)).rejects.toThrow('Invalid comment ID');
  });

  it("should fail to update comment without data", async () => {
    await expect(CommentServices.updateComment(1, null)).rejects.toThrow("No update data provided");
  });

  it("should fail to update comment with empty object", async () => {
    await expect(CommentServices.updateComment(1, {})).rejects.toThrow("No update data provided");
  });

  it("should fail to update comment with invalid comment text", async () => {
    const invalidUpdateData = {
      CommentText: "   "
    };

    await expect(CommentServices.updateComment(1, invalidUpdateData)).rejects.toThrow(
      "Invalid CommentText: Must be non-empty string"
    );
  });

  it("should fail to delete comment with invalid ID", async () => {
    await expect(CommentServices.deleteComment(NaN)).rejects.toThrow('Invalid comment ID');
  });

  it("should fail to delete comments by bug with invalid bug ID", async () => {
    await expect(CommentServices.deleteCommentsByBug(NaN)).rejects.toThrow('Invalid bug ID');
  });
});

