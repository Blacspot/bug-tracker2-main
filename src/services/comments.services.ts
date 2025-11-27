import { CommentRepository } from "../repositories/comments.repositories";
import { BugRepository } from "../repositories/bugs.repositories";
import { UserRepository } from "../repositories/user.repositories";
import { Comment, CreateComment, UpdateComment } from "../Types/comments.types";
import { Response } from 'express';
import { Request } from 'express';

const validateAndParseCommentData = async (body: any): Promise<CreateComment> => {
    const { BugID, UserID, CommentText } = body ?? {};

    if (!BugID || !UserID || !CommentText) {
        throw new Error("Missing required fields: BugID, UserID, and CommentText are required");
    }

    if (typeof BugID !== 'number' || typeof UserID !== 'number' || typeof CommentText !== 'string') {
        throw new Error("Invalid field types: BugID and UserID must be numbers, CommentText must be string");
    }

    const commentText = CommentText.trim();
    if (commentText.length === 0) {
        throw new Error("CommentText cannot be empty");
    }

    // Validate bug exists
    const bug = await BugRepository.getBugById(BugID);
    if (!bug) {
        throw new Error("Invalid BugID: Bug does not exist");
    }

    // Validate user exists
    const user = await UserRepository.getUserById(UserID);
    if (!user) {
        throw new Error("Invalid UserID: User does not exist");
    }

    return {
        BugID,
        UserID,
        CommentText: commentText
    };
};

const validateAndParseUpdateCommentData = (body: any): UpdateComment => {
    const { CommentText } = body ?? {};

    if (CommentText !== undefined && (typeof CommentText !== 'string' || CommentText.trim().length === 0)) {
        throw new Error("Invalid CommentText: Must be non-empty string");
    }

    return {
        CommentText: CommentText ? CommentText.trim() : undefined
    };
};

// Get all comments
export const getAllComments = async (): Promise<Comment[]> => {
    try {
        const comments: Comment[] = await CommentRepository.getAllComments();
        return comments;
    } catch (error: any) {
        console.error('Error fetching comments:', error);
        throw error;
    }
};

// Get comment by ID
export const getCommentById = async (commentId: number): Promise<Comment | null> => {
    try {
        if (isNaN(commentId)) {
            throw new Error('Invalid comment ID');
        }

        const comment: Comment | null = await CommentRepository.getCommentById(commentId);
        return comment;
    } catch (error: any) {
        console.error('Error fetching comment by ID:', error);
        throw error;
    }
};

// Get comments by bug
export const getCommentsByBug = async (bugId: number): Promise<Comment[]> => {
    try {
        if (isNaN(bugId)) {
            throw new Error('Invalid bug ID');
        }

        const comments: Comment[] = await CommentRepository.getCommentsByBug(bugId);
        return comments;
    } catch (error: any) {
        console.error('Error fetching comments by bug:', error);
        throw error;
    }
};

// Get comments by user
export const getCommentsByUser = async (userId: number): Promise<Comment[]> => {
    try {
        if (isNaN(userId)) {
            throw new Error('Invalid user ID');
        }

        const comments: Comment[] = await CommentRepository.getCommentsByUser(userId);
        return comments;
    } catch (error: any) {
        console.error('Error fetching comments by user:', error);
        throw error;
    }
};

// Create new comment
export const createComment = async (commentData: any): Promise<Comment> => {
    console.log("Comment received", commentData);
    if (!commentData) {
        throw new Error("Please provide comment data");
    }

    try {
        const newComment = await validateAndParseCommentData(commentData);
        console.log("Comment parsed", newComment);

        const createdComment = await CommentRepository.createComment(newComment);
        return createdComment;
    } catch (error: any) {
        console.error('Error creating comment:', error);
        throw error;
    }
};

// Update comment
export const updateComment = async (commentId: number, commentData: any): Promise<Comment | null> => {
    try {
        if (isNaN(commentId)) {
            throw new Error('Invalid comment ID');
        }

        if (!commentData || Object.keys(commentData).length === 0) {
            throw new Error("No update data provided");
        }

        const updateData = validateAndParseUpdateCommentData(commentData);

        const updatedComment = await CommentRepository.updateComment(commentId, updateData);
        return updatedComment;
    } catch (error: any) {
        console.error('Error updating comment:', error);
        throw error;
    }
};

// Delete comment
export const deleteComment = async (commentId: number): Promise<boolean> => {
    try {
        if (isNaN(commentId)) {
            throw new Error('Invalid comment ID');
        }

        const deleted = await CommentRepository.deleteComment(commentId);
        return deleted;
    } catch (error: any) {
        console.error('Error deleting comment:', error);
        throw error;
    }
};

// Delete all comments for a bug
export const deleteCommentsByBug = async (bugId: number): Promise<number> => {
    try {
        if (isNaN(bugId)) {
            throw new Error('Invalid bug ID');
        }

        const deletedCount = await CommentRepository.deleteCommentsByBug(bugId);
        return deletedCount;
    } catch (error: any) {
        console.error('Error deleting comments by bug:', error);
        throw error;
    }
};