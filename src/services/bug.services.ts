import { BugRepository } from "../repositories/bugs.repositories";
import { ProjectRepository } from "../repositories/projects.repositories";
import { Bug, CreateBug, UpdateBug } from "../Types/bugs.types";

const validateAndParseBugData = async (body: any): Promise<CreateBug> => {
    const { Title, Description, Status, Priority, ProjectID, ReportedBy, AssignedTo } = body ?? {};

    if (!Title || !ProjectID) {
        throw new Error("Missing required fields: Title and ProjectID are required");
    }

    if (typeof Title !== 'string' || typeof ProjectID !== 'number') {
        throw new Error("Invalid field types: Title must be string, ProjectID must be number");
    }

    const title = Title.trim();
    if (title.length === 0) {
        throw new Error("Title cannot be empty");
    }

    // Validate project exists
    const project = await ProjectRepository.getProjectById(ProjectID);
    if (!project) {
        throw new Error("Invalid ProjectID: Project does not exist");
    }

    // Validate status if provided
    const validStatuses = ['Open', 'In Progress', 'Resolved', 'Closed'];
    if (Status && !validStatuses.includes(Status)) {
        throw new Error(`Invalid Status: Must be one of ${validStatuses.join(', ')}`);
    }

    // Validate priority if provided
    const validPriorities = ['Low', 'Medium', 'High', 'Critical'];
    if (Priority && !validPriorities.includes(Priority)) {
        throw new Error(`Invalid Priority: Must be one of ${validPriorities.join(', ')}`);
    }

    return {
        Title: title,
        Description: Description || undefined,
        Status: Status || 'Open',
        Priority: Priority || 'Medium',
        ProjectID,
        ReportedBy: ReportedBy || undefined,
        AssignedTo: AssignedTo || undefined
    };
};

const validateAndParseUpdateBugData = (body: any): UpdateBug => {
    const { Title, Description, Status, Priority, AssignedTo } = body ?? {};

    if (Title !== undefined && (typeof Title !== 'string' || Title.trim().length === 0)) {
        throw new Error("Invalid Title: Must be non-empty string");
    }

    // Validate status if provided
    const validStatuses = ['Open', 'In Progress', 'Resolved', 'Closed'];
    if (Status && !validStatuses.includes(Status)) {
        throw new Error(`Invalid Status: Must be one of ${validStatuses.join(', ')}`);
    }

    // Validate priority if provided
    const validPriorities = ['Low', 'Medium', 'High', 'Critical'];
    if (Priority && !validPriorities.includes(Priority)) {
        throw new Error(`Invalid Priority: Must be one of ${validPriorities.join(', ')}`);
    }

    return {
        Title: Title ? Title.trim() : undefined,
        Description,
        Status,
        Priority,
        AssignedTo
    };
};

// Get all bugs
export const getAllBugs = async (): Promise<Bug[]> => {
    try {
        const bugs: Bug[] = await BugRepository.getAllBugs();
        return bugs;
    } catch (error: any) {
        console.error('Error fetching bugs:', error);
        throw error;
    }
};

// Get bug by ID
export const getBugById = async (bugId: number): Promise<Bug | null> => {
    try {
        if (isNaN(bugId)) {
            throw new Error('Invalid bug ID');
        }

        const bug: Bug | null = await BugRepository.getBugById(bugId);
        return bug;
    } catch (error: any) {
        console.error('Error fetching bug by ID:', error);
        throw error;
    }
};

// Get bugs by project
export const getBugsByProject = async (projectId: number): Promise<Bug[]> => {
    try {
        if (isNaN(projectId)) {
            throw new Error('Invalid project ID');
        }

        const bugs: Bug[] = await BugRepository.getBugsByProject(projectId);
        return bugs;
    } catch (error: any) {
        console.error('Error fetching bugs by project:', error);
        throw error;
    }
};

// Get bugs by assignee
export const getBugsByAssignee = async (assigneeId: number): Promise<Bug[]> => {
    try {
        if (isNaN(assigneeId)) {
            throw new Error('Invalid assignee ID');
        }

        const bugs: Bug[] = await BugRepository.getBugsByAssignee(assigneeId);
        return bugs;
    } catch (error: any) {
        console.error('Error fetching bugs by assignee:', error);
        throw error;
    }
};

// Get bugs by reporter
export const getBugsByReporter = async (reporterId: number): Promise<Bug[]> => {
    try {
        if (isNaN(reporterId)) {
            throw new Error('Invalid reporter ID');
        }

        const bugs: Bug[] = await BugRepository.getBugsByReporter(reporterId);
        return bugs;
    } catch (error: any) {
        console.error('Error fetching bugs by reporter:', error);
        throw error;
    }
};

// Get bugs by status
export const getBugsByStatus = async (status: string): Promise<Bug[]> => {
    try {
        if (!status) {
            throw new Error('Status parameter is required');
        }

        const bugs: Bug[] = await BugRepository.getBugsByStatus(status);
        return bugs;
    } catch (error: any) {
        console.error('Error fetching bugs by status:', error);
        throw error;
    }
};

// Create new bug
export const createBug = async (bugData: any): Promise<Bug> => {
    console.log("Bug received", bugData);
    if (!bugData) {
        throw new Error("Please provide bug data");
    }

    try {
        const newBug = await validateAndParseBugData(bugData);
        console.log("Bug parsed", newBug);

        const createdBug = await BugRepository.createBug(newBug);
        return createdBug;
    } catch (error: any) {
        console.error('Error creating bug:', error);
        throw error;
    }
};

// Update bug
export const updateBug = async (bugId: number, bugData: any): Promise<Bug | null> => {
    try {
        if (isNaN(bugId)) {
            throw new Error('Invalid bug ID');
        }

        if (!bugData || Object.keys(bugData).length === 0) {
            throw new Error("No update data provided");
        }

        const updateData = validateAndParseUpdateBugData(bugData);

        const updatedBug = await BugRepository.updateBug(bugId, updateData);
        return updatedBug;
    } catch (error: any) {
        console.error('Error updating bug:', error);
        throw error;
    }
};

// Delete bug
export const deleteBug = async (bugId: number): Promise<boolean> => {
    try {
        if (isNaN(bugId)) {
            throw new Error('Invalid bug ID');
        }

        const deleted = await BugRepository.deleteBug(bugId);
        return deleted;
    } catch (error: any) {
        console.error('Error deleting bug:', error);
        throw error;
    }
};