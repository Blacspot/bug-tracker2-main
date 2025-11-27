import { ProjectRepository } from '../../src/repositories/projects.repositories';
import { UserRepository } from '../../src/repositories/user.repositories';
import * as ProjectServices from '../../src/services/projects.services';

jest.mock('../../src/repositories/projects.repositories.ts');
jest.mock('../../src/repositories/user.repositories.ts');

describe("Project service testing", () => {

  // Tests for successful project functions
  it("should return a list of all projects", async () => {
    const mockProjects: any = [
      {
        ProjectID: 1,
        ProjectName: "Bug Tracker App",
        Description: "A comprehensive bug tracking application",
        CreatedBy: 1,
        CreatedAt: new Date("2025-10-30T14:30:00Z")
      },
      {
        ProjectID: 2,
        ProjectName: "E-commerce Platform",
        Description: "Online shopping platform",
        CreatedBy: 2,
        CreatedAt: new Date("2025-11-01T10:00:00Z")
      }
    ];

    (ProjectRepository.getAllProjects as jest.Mock).mockResolvedValue(mockProjects);

    const projects = await ProjectServices.getAllProjects();

    expect(projects).toEqual(mockProjects);
    expect(ProjectRepository.getAllProjects).toHaveBeenCalled();
  });

  it("should get a project by ID", async () => {
    const mockProject = {
      ProjectID: 1,
      ProjectName: "Bug Tracker App",
      Description: "A comprehensive bug tracking application",
      CreatedBy: 1,
      CreatedAt: new Date("2025-10-30T14:30:00Z")
    };

    (ProjectRepository.getProjectById as jest.Mock).mockResolvedValue(mockProject);

    const project = await ProjectServices.getProjectById(1);

    expect(project).toEqual(mockProject);
    expect(ProjectRepository.getProjectById).toHaveBeenCalledWith(1);
  });

  it("should get projects by creator ID", async () => {
    const mockProjects: any = [
      {
        ProjectID: 1,
        ProjectName: "Bug Tracker App",
        Description: "A comprehensive bug tracking application",
        CreatedBy: 1,
        CreatedAt: new Date("2025-10-30T14:30:00Z")
      },
      {
        ProjectID: 2,
        ProjectName: "Task Manager",
        Description: "Simple task management tool",
        CreatedBy: 1,
        CreatedAt: new Date("2025-11-01T10:00:00Z")
      }
    ];

    (ProjectRepository.getProjectsByCreator as jest.Mock).mockResolvedValue(mockProjects);

    const projects = await ProjectServices.getProjectsByCreator(1);

    expect(projects).toEqual(mockProjects);
    expect(ProjectRepository.getProjectsByCreator).toHaveBeenCalledWith(1);
  });

  it("should create a project successfully", async () => {
    const mockProjectData = {
      ProjectName: "New Project",
      Description: "A new project description",
      CreatedBy: 1
    };

    const mockCreatedProject = {
      ProjectID: 1,
      ...mockProjectData,
      CreatedAt: new Date("2025-11-04T12:00:00Z")
    };

    const mockUser = {
      UserID: 1,
      Username: "testuser",
      Email: "test@example.com",
      PasswordHash: "hashedpassword",
      Role: "user",
      CreatedAt: new Date()
    };

    (UserRepository.getUserById as jest.Mock).mockResolvedValue(mockUser);
    (ProjectRepository.createProject as jest.Mock).mockResolvedValue(mockCreatedProject);

    const project = await ProjectServices.createProject(mockProjectData);

    expect(project).toEqual(mockCreatedProject);
    expect(UserRepository.getUserById).toHaveBeenCalledWith(1);
    expect(ProjectRepository.createProject).toHaveBeenCalledWith(mockProjectData);
  });

  it("should update a project successfully", async () => {
    const mockUpdateData = {
      ProjectName: "Updated Project Name",
      Description: "Updated description"
    };

    const mockUpdatedProject = {
      ProjectID: 1,
      ProjectName: "Updated Project Name",
      Description: "Updated description",
      CreatedBy: 1,
      CreatedAt: new Date("2025-10-30T14:30:00Z")
    };

    (ProjectRepository.updateProject as jest.Mock).mockResolvedValue(mockUpdatedProject);

    const project = await ProjectServices.updateProject(1, mockUpdateData);

    expect(project).toEqual(mockUpdatedProject);
    expect(ProjectRepository.updateProject).toHaveBeenCalledWith(1, mockUpdateData);
  });

  it("should delete a project successfully", async () => {
    (ProjectRepository.deleteProject as jest.Mock).mockResolvedValue(true);

    const result = await ProjectServices.deleteProject(1);

    expect(result).toBe(true);
    expect(ProjectRepository.deleteProject).toHaveBeenCalledWith(1);
  });

  // Additional fail tests for edge cases
  it("should fail to get project by ID with invalid ID", async () => {
    await expect(ProjectServices.getProjectById(NaN)).rejects.toThrow('Invalid project ID');
  });

  it("should fail to get projects by creator with invalid creator ID", async () => {
    await expect(ProjectServices.getProjectsByCreator(NaN)).rejects.toThrow('Invalid creator ID');
  });

  it("should fail to create project without data", async () => {
    await expect(ProjectServices.createProject(null)).rejects.toThrow("Please provide project data");
  });

  it("should fail to create project with missing required fields", async () => {
    const incompleteData = {
      Description: "Some description"
      // Missing ProjectName and CreatedBy
    };

    await expect(ProjectServices.createProject(incompleteData)).rejects.toThrow(
      "Missing required fields: ProjectName and CreatedBy are required"
    );
  });

  it("should fail to create project with invalid field types", async () => {
    const invalidData = {
      ProjectName: 123, // Should be string
      CreatedBy: "not a number" // Should be number
    };

    await expect(ProjectServices.createProject(invalidData)).rejects.toThrow(
      "Invalid field types: ProjectName must be string, CreatedBy must be number"
    );
  });

  it("should fail to create project with empty project name", async () => {
    const emptyNameData = {
      ProjectName: "   ",
      CreatedBy: 1
    };

    const mockUser = {
      UserID: 1,
      Username: "testuser",
      Email: "test@example.com",
      PasswordHash: "hashedpassword",
      Role: "user",
      CreatedAt: new Date()
    };

    (UserRepository.getUserById as jest.Mock).mockResolvedValue(mockUser);

    await expect(ProjectServices.createProject(emptyNameData)).rejects.toThrow(
      "ProjectName cannot be empty"
    );
  });

  it("should fail to create project with invalid user ID", async () => {
    const invalidUserData = {
      ProjectName: "Valid Project",
      CreatedBy: 999
    };

    (UserRepository.getUserById as jest.Mock).mockResolvedValue(null);

    await expect(ProjectServices.createProject(invalidUserData)).rejects.toThrow(
      "Invalid CreatedBy: User does not exist"
    );
  });

  it("should fail to update project with invalid project ID", async () => {
    const updateData = {
      ProjectName: "Updated name"
    };

    await expect(ProjectServices.updateProject(NaN, updateData)).rejects.toThrow('Invalid project ID');
  });

  it("should fail to update project without data", async () => {
    await expect(ProjectServices.updateProject(1, null)).rejects.toThrow("No update data provided");
  });

  it("should fail to update project with empty object", async () => {
    await expect(ProjectServices.updateProject(1, {})).rejects.toThrow("No update data provided");
  });

  it("should fail to update project with invalid project name", async () => {
    const invalidUpdateData = {
      ProjectName: "   "
    };

    await expect(ProjectServices.updateProject(1, invalidUpdateData)).rejects.toThrow(
      "Invalid ProjectName: Must be non-empty string"
    );
  });

  it("should fail to delete project with invalid ID", async () => {
    await expect(ProjectServices.deleteProject(NaN)).rejects.toThrow('Invalid project ID');
  });
});