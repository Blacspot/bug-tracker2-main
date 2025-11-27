import { getPool } from '../../db/config';
import { Project, CreateProject, UpdateProject } from '../Types/projects.types';
import * as sql from 'mssql';

export class ProjectRepository {
  // Get all projects
  static async getAllProjects(): Promise<Project[]> {
    try {
      const pool: sql.ConnectionPool = await getPool();
      const result = await pool.request().query('SELECT * FROM Projects ORDER BY CreatedAt DESC');
      return result.recordset;
    } catch (error) {
      console.error('Error fetching projects:', error);
      throw error;
    }
  }

  // Get project by ID
  static async getProjectById(projectId: number): Promise<Project | null> {
    try {
      const pool: sql.ConnectionPool = await getPool();
      const result = await pool.request()
        .input('projectId', projectId)
        .query('SELECT * FROM Projects WHERE ProjectID = @projectId');
      return result.recordset[0] || null;
    } catch (error) {
      console.error('Error fetching project by ID:', error);
      throw error;
    }
  }

  // Get projects by creator
  static async getProjectsByCreator(creatorId: number): Promise<Project[]> {
    try {
      const pool: sql.ConnectionPool = await getPool();
      const result = await pool.request()
        .input('creatorId', creatorId)
        .query('SELECT * FROM Projects WHERE CreatedBy = @creatorId ORDER BY CreatedAt DESC');
      return result.recordset;
    } catch (error) {
      console.error('Error fetching projects by creator:', error);
      throw error;
    }
  }

  // Create new project
  static async createProject(projectData: CreateProject): Promise<Project> {
    try {
      const pool: sql.ConnectionPool = await getPool();
      const result = await pool.request()
        .input('projectName', projectData.ProjectName)
        .input('description', projectData.Description || null)
        .input('createdBy', projectData.CreatedBy)
        .query('INSERT INTO Projects (ProjectName, Description, CreatedBy) OUTPUT INSERTED.* VALUES (@projectName, @description, @createdBy)');
      return result.recordset[0];
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  }

  // Update project
  static async updateProject(projectId: number, projectData: UpdateProject): Promise<Project | null> {
    try {
      const updateFields: string[] = [];
      let paramIndex = 1;

      const request = (await getPool()).request();

      if (projectData.ProjectName) {
        updateFields.push(`ProjectName = @p${paramIndex}`);
        request.input(`p${paramIndex++}`, projectData.ProjectName);
      }
      if (projectData.Description !== undefined) {
        updateFields.push(`Description = @p${paramIndex}`);
        request.input(`p${paramIndex++}`, projectData.Description);
      }

      if (updateFields.length === 0) {
        throw new Error('No fields to update');
      }

      request.input(`p${paramIndex}`, projectId);

      const query = `
        UPDATE Projects
        SET ${updateFields.join(', ')}
        OUTPUT INSERTED.*
        WHERE ProjectID = @p${paramIndex}
      `;

      const result = await request.query(query);
      return result.recordset[0] || null;
    } catch (error) {
      console.error('Error updating project:', error);
      throw error;
    }
  }

  // Delete project
  static async deleteProject(projectId: number): Promise<boolean> {
    try {
      const pool: sql.ConnectionPool = await getPool();
      const result = await pool.request()
        .input('projectId', projectId)
        .query('DELETE FROM Projects WHERE ProjectID = @projectId');
      return result.rowsAffected[0] > 0;
    } catch (error) {
      console.error('Error deleting project:', error);
      throw error;
    }
  }
}