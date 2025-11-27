/**
 * Project Controller Module
 *
 * This module handles HTTP requests for project management operations.
 * Projects serve as organizational containers for bugs and provide
 * structure for team collaboration. The controller manages all CRUD
 * operations and access control for project resources.
 *
 * All functions implement proper RESTful API patterns with appropriate
 * HTTP status codes and error handling.
 */

import { Request, Response } from 'express';
import { handleControllerError } from '../utils/errorHandler';
import {
    getAllProjects,
    getProjectById,
    getProjectsByCreator,
    createProject,
    updateProject,
    deleteProject
} from '../services/projects.services';

/**
 * GET /projects - Retrieve all projects
 *
 * Returns a complete list of all projects in the system.
 * Typically used for project browsing, admin dashboards, or directory views.
 * May be restricted based on user permissions in production.
 *
 * @param req - Express request object
 * @param res - Express response object
 */
export const getAllProjectsController = async (req: Request, res: Response) => {
    try {
        const projects = await getAllProjects();
        res.json({ projects });
    } catch (error: any) {
        handleControllerError(error, res);
    }
};

/**
 * GET /projects/:id - Retrieve a specific project by ID
 *
 * Fetches detailed information about a single project.
 * Essential for project detail pages and when accessing project-specific data.
 * Returns 404 if the project doesn't exist.
 *
 * @param req - Express request object with project ID in params
 * @param res - Express response object
 */
export const getProjectByIdController = async (req: Request, res: Response) => {
    try {
        const projectId = parseInt(req.params.id);
        const project = await getProjectById(projectId);
        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }
        res.json({ project });
    } catch (error: any) {
        handleControllerError(error, res);
    }
};

/**
 * GET /projects/creator/:creatorId - Retrieve projects by creator
 *
 * Returns all projects created by a specific user.
 * Useful for user dashboards, profile pages, and tracking project ownership.
 * Helps users see their project creation history and contributions.
 *
 * @param req - Express request object with creatorId in params
 * @param res - Express response object
 */
export const getProjectsByCreatorController = async (req: Request, res: Response) => {
    try {
        const creatorId = parseInt(req.params.creatorId);
        const projects = await getProjectsByCreator(creatorId);
        res.json({ projects });
    } catch (error: any) {
        handleControllerError(error, res);
    }
};

/**
 * POST /projects - Create a new project
 *
 * Creates a new project in the system with the authenticated user as creator.
 * Requires project name and associates it with the creator.
 * Returns the created project with 201 status and generated ID.
 *
 * @param req - Express request object with project data in body
 * @param res - Express response object
 */
export const createProjectController = async (req: Request, res: Response) => {
    try {
        const projectData = req.body;
        const project = await createProject(projectData);
        res.status(201).json({
            message: "Project created successfully",
            project
        });
    } catch (error: any) {
        handleControllerError(error, res);
    }
};

/**
 * PUT /projects/:id - Update an existing project
 *
 * Modifies project information such as name or description.
 * Supports partial updates - only provided fields are changed.
 * Should be restricted to project creators or administrators.
 * Returns 404 if the project doesn't exist.
 *
 * @param req - Express request object with project ID in params and update data in body
 * @param res - Express response object
 */
export const updateProjectController = async (req: Request, res: Response) => {
    try {
        const projectId = parseInt(req.params.id);
        const projectData = req.body;
        const project = await updateProject(projectId, projectData);
        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }
        res.json({
            message: "Project updated successfully",
            project
        });
    } catch (error: any) {
        handleControllerError(error, res);
    }
};

/**
 * DELETE /projects/:id - Delete a project
 *
 * Permanently removes a project from the system.
 * Should cascade to delete associated bugs and comments.
 * Highly destructive operation - should be restricted to administrators
 * or project creators with proper confirmation.
 * Returns 404 if the project doesn't exist.
 *
 * @param req - Express request object with project ID in params
 * @param res - Express response object
 */
export const deleteProjectController = async (req: Request, res: Response) => {
    try {
        const projectId = parseInt(req.params.id);
        const deleted = await deleteProject(projectId);
        if (!deleted) {
            return res.status(404).json({ message: "Project not found" });
        }
        res.json({ message: "Project deleted successfully" });
    } catch (error: any) {
        handleControllerError(error, res);
    }
};