/**
 * Comment Controller Module
 *
 * This module handles HTTP requests for comment management.
 * Comments provide threaded discussions on bugs, enabling team collaboration.
 * The controller manages comment CRUD operations and bulk operations.
 *
 * All functions follow RESTful conventions and handle parameter validation,
 * service calls, and appropriate HTTP response formatting.
 */

import { Request, Response } from 'express';
import { handleControllerError } from '../utils/errorHandler';
import {
    getAllComments,
    getCommentById,
    getCommentsByBug,
    getCommentsByUser,
    createComment,
    updateComment,
    deleteComment,
    deleteCommentsByBug
} from '../services/comments.services';

/**
 * GET /comments - Retrieve all comments
 *
 * Returns a complete list of all comments across all bugs.
 * Primarily used for administrative purposes or system-wide analysis.
 *
 * @param req - Express request object
 * @param res - Express response object
 */
export const getAllCommentsController = async (req: Request, res: Response) => {
    try {
        const comments = await getAllComments();
        res.json({ comments });
    } catch (error: any) {
        handleControllerError(error, res);
    }
};

/**
 * GET /comments/:id - Retrieve a specific comment by ID
 *
 * Fetches a single comment for viewing or editing.
 * Returns 404 if the comment doesn't exist.
 *
 * @param req - Express request object with comment ID in params
 * @param res - Express response object
 */
export const getCommentByIdController = async (req: Request, res: Response) => {
    try {
        const commentId = parseInt(req.params.id);
        const comment = await getCommentById(commentId);
        if (!comment) {
            return res.status(404).json({ message: "Comment not found" });
        }
        res.json({ comment });
    } catch (error: any) {
        handleControllerError(error, res);
    }
};

/**
 * GET /comments/bug/:bugId - Retrieve all comments for a specific bug
 *
 * Returns the complete comment thread for a bug, ordered chronologically.
 * This is the primary endpoint for displaying bug discussion threads.
 * Essential for bug detail pages and collaboration features.
 *
 * @param req - Express request object with bugId in params
 * @param res - Express response object
 */
export const getCommentsByBugController = async (req: Request, res: Response) => {
    try {
        const bugId = parseInt(req.params.bugId);
        const comments = await getCommentsByBug(bugId);
        res.json({ comments });
    } catch (error: any) {
        handleControllerError(error, res);
    }
};

/**
 * GET /comments/user/:userId - Retrieve all comments by a specific user
 *
 * Shows the commenting activity and contributions of a team member.
 * Useful for user profiles, activity feeds, and engagement analytics.
 *
 * @param req - Express request object with userId in params
 * @param res - Express response object
 */
export const getCommentsByUserController = async (req: Request, res: Response) => {
    try {
        const userId = parseInt(req.params.userId);
        const comments = await getCommentsByUser(userId);
        res.json({ comments });
    } catch (error: any) {
        handleControllerError(error, res);
    }
};

/**
 * POST /comments - Create a new comment
 *
 * Adds a new comment to a bug discussion thread.
 * Requires valid bug and user references in the request body.
 * Returns the created comment with 201 status.
 *
 * @param req - Express request object with comment data in body
 * @param res - Express response object
 */
export const createCommentController = async (req: Request, res: Response) => {
    try {
        const commentData = req.body;
        const comment = await createComment(commentData);
        res.status(201).json({
            message: "Comment created successfully",
            comment
        });
    } catch (error: any) {
        handleControllerError(error, res);
    }
};

/**
 * PUT /comments/:id - Update an existing comment
 *
 * Modifies the text content of a comment.
 * Only the comment text can be changed - bug and user associations are fixed.
 * Returns 404 if the comment doesn't exist.
 *
 * @param req - Express request object with comment ID in params and update data in body
 * @param res - Express response object
 */
export const updateCommentController = async (req: Request, res: Response) => {
    try {
        const commentId = parseInt(req.params.id);
        const commentData = req.body;
        const comment = await updateComment(commentId, commentData);
        if (!comment) {
            return res.status(404).json({ message: "Comment not found" });
        }
        res.json({
            message: "Comment updated successfully",
            comment
        });
    } catch (error: any) {
        handleControllerError(error, res);
    }
};

/**
 * DELETE /comments/:id - Delete a specific comment
 *
 * Permanently removes a comment from the discussion thread.
 * Should be restricted to comment authors or administrators.
 * Returns 404 if the comment doesn't exist.
 *
 * @param req - Express request object with comment ID in params
 * @param res - Express response object
 */
export const deleteCommentController = async (req: Request, res: Response) => {
    try {
        const commentId = parseInt(req.params.id);
        const deleted = await deleteComment(commentId);
        if (!deleted) {
            return res.status(404).json({ message: "Comment not found" });
        }
        res.json({ message: "Comment deleted successfully" });
    } catch (error: any) {
        handleControllerError(error, res);
    }
};

/**
 * DELETE /comments/bug/:bugId - Delete all comments for a specific bug
 *
 * Bulk operation to remove all comments associated with a bug.
 * Typically called when deleting a bug (though CASCADE handles this automatically).
 * Returns the number of comments that were deleted.
 *
 * @param req - Express request object with bugId in params
 * @param res - Express response object
 */
export const deleteCommentsByBugController = async (req: Request, res: Response) => {
    try {
        const bugId = parseInt(req.params.bugId);
        const deletedCount = await deleteCommentsByBug(bugId);
        res.json({
            message: `${deletedCount} comments deleted successfully`
        });
    } catch (error: any) {
        handleControllerError(error, res);
    }
};