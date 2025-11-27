import { ProjectRepository } from "../repositories/projects.repositories";
import { UserRepository } from "../repositories/user.repositories";
import { Project, CreateProject, UpdateProject } from "../Types/projects.types";

const validateAndParseProjectData = async (body: any): Promise<CreateProject> => {
    const { ProjectName, Description, CreatedBy } = body ?? {};

    if (!ProjectName || !CreatedBy) {
        throw new Error("Missing required fields: ProjectName and CreatedBy are required");
    }

    if (typeof ProjectName !== 'string' || typeof CreatedBy !== 'number') {
        throw new Error("Invalid field types: ProjectName must be string, CreatedBy must be number");
    }

    const projectName = ProjectName.trim();
    if (projectName.length === 0) {
        throw new Error("ProjectName cannot be empty");
    }

    // Validate user exists
    const user = await UserRepository.getUserById(CreatedBy);
    if (!user) {
        throw new Error("Invalid CreatedBy: User does not exist");
    }

    return {
        ProjectName: projectName,
        Description: Description || undefined,
        CreatedBy
    };
};

const validateAndParseUpdateProjectData = (body: any): UpdateProject => {
    const { ProjectName, Description } = body ?? {};

    if (ProjectName !== undefined && (typeof ProjectName !== 'string' || ProjectName.trim().length === 0)) {
        throw new Error("Invalid ProjectName: Must be non-empty string");
    }

    return {
        ProjectName: ProjectName ? ProjectName.trim() : undefined,
        Description
    };
};

// Get all projects
export const getAllProjects = async (): Promise<Project[]> => {
    try {
        const projects: Project[] = await ProjectRepository.getAllProjects();
        return projects;
    } catch (error: any) {
        console.error('Error fetching projects:', error);
        throw error;
    }
};

// Get project by ID
export const getProjectById = async (projectId: number): Promise<Project | null> => {
    try {
        if (isNaN(projectId)) {
            throw new Error('Invalid project ID');
        }

        const project: Project | null = await ProjectRepository.getProjectById(projectId);
        return project;
    } catch (error: any) {
        console.error('Error fetching project by ID:', error);
        throw error;
    }
};

// Get projects by creator
export const getProjectsByCreator = async (creatorId: number): Promise<Project[]> => {
    try {
        if (isNaN(creatorId)) {
            throw new Error('Invalid creator ID');
        }

        const projects: Project[] = await ProjectRepository.getProjectsByCreator(creatorId);
        return projects;
    } catch (error: any) {
        console.error('Error fetching projects by creator:', error);
        throw error;
    }
};

// Create new project
export const createProject = async (projectData: any): Promise<Project> => {
    console.log("Project received", projectData);
    if (!projectData) {
        throw new Error("Please provide project data");
    }

    try {
        const newProject = await validateAndParseProjectData(projectData);
        console.log("Project parsed", newProject);

        const createdProject = await ProjectRepository.createProject(newProject);
        return createdProject;
    } catch (error: any) {
        console.error('Error creating project:', error);
        throw error;
    }
};

// Update project
export const updateProject = async (projectId: number, projectData: any): Promise<Project | null> => {
    try {
        if (isNaN(projectId)) {
            throw new Error('Invalid project ID');
        }

        if (!projectData || Object.keys(projectData).length === 0) {
            throw new Error("No update data provided");
        }

        const updateData = validateAndParseUpdateProjectData(projectData);

        const updatedProject = await ProjectRepository.updateProject(projectId, updateData);
        return updatedProject;
    } catch (error: any) {
        console.error('Error updating project:', error);
        throw error;
    }
};

// Delete project
export const deleteProject = async (projectId: number): Promise<boolean> => {
    try {
        if (isNaN(projectId)) {
            throw new Error('Invalid project ID');
        }

        const deleted = await ProjectRepository.deleteProject(projectId);
        return deleted;
    } catch (error: any) {
        console.error('Error deleting project:', error);
        throw error;
    }
};