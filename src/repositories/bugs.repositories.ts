import { getPool } from '../../db/config';
import { Bug, CreateBug, UpdateBug } from '../Types/bugs.types';
import * as sql from 'mssql';

export class BugRepository {
  // Get all bugs
  static async getAllBugs(): Promise<Bug[]> {
    try {
      const pool: sql.ConnectionPool = await getPool();
      const result = await pool.request().query(`
        SELECT b.*,
               (SELECT COUNT(*) FROM Comments c WHERE c.BugID = b.BugID) as CommentCount
        FROM Bugs b
        ORDER BY b.CreatedAt DESC
      `);
      return result.recordset;
    } catch (error) {
      console.error('Error fetching bugs:', error);
      throw error;
    }
  }

  // Get bug by ID
  static async getBugById(bugId: number): Promise<Bug | null> {
    try {
      const pool: sql.ConnectionPool = await getPool();
      const result = await pool.request()
        .input('bugId', bugId)
        .query('SELECT * FROM Bugs WHERE BugID = @bugId');
      return result.recordset[0] || null;
    } catch (error) {
      console.error('Error fetching bug by ID:', error);
      throw error;
    }
  }

  // Get bugs by project
  static async getBugsByProject(projectId: number): Promise<Bug[]> {
    try {
      const pool: sql.ConnectionPool = await getPool();
      const result = await pool.request()
        .input('projectId', projectId)
        .query('SELECT * FROM Bugs WHERE ProjectID = @projectId ORDER BY CreatedAt DESC');
      return result.recordset;
    } catch (error) {
      console.error('Error fetching bugs by project:', error);
      throw error;
    }
  }

  // Get bugs by assignee
  static async getBugsByAssignee(assigneeId: number): Promise<Bug[]> {
    try {
      const pool: sql.ConnectionPool = await getPool();
      const result = await pool.request()
        .input('assigneeId', assigneeId)
        .query('SELECT * FROM Bugs WHERE AssignedTo = @assigneeId ORDER BY CreatedAt DESC');
      return result.recordset;
    } catch (error) {
      console.error('Error fetching bugs by assignee:', error);
      throw error;
    }
  }

  // Get bugs by reporter
  static async getBugsByReporter(reporterId: number): Promise<Bug[]> {
    try {
      const pool: sql.ConnectionPool = await getPool();
      const result = await pool.request()
        .input('reporterId', reporterId)
        .query('SELECT * FROM Bugs WHERE ReportedBy = @reporterId ORDER BY CreatedAt DESC');
      return result.recordset;
    } catch (error) {
      console.error('Error fetching bugs by reporter:', error);
      throw error;
    }
  }

  // Get bugs by status
  static async getBugsByStatus(status: string): Promise<Bug[]> {
    try {
      const pool: sql.ConnectionPool = await getPool();
      const result = await pool.request()
        .input('status', status)
        .query('SELECT * FROM Bugs WHERE Status = @status ORDER BY CreatedAt DESC');
      return result.recordset;
    } catch (error) {
      console.error('Error fetching bugs by status:', error);
      throw error;
    }
  }

  // Create new bug
  static async createBug(bugData: CreateBug): Promise<Bug> {
    try {
      const pool: sql.ConnectionPool = await getPool();
      const result = await pool.request()
        .input('title', bugData.Title)
        .input('description', bugData.Description || null)
        .input('status', bugData.Status || 'Open')
        .input('priority', bugData.Priority || 'Medium')
        .input('projectID', bugData.ProjectID)
        .input('reportedBy', bugData.ReportedBy || null)
        .input('assignedTo', bugData.AssignedTo || null)
        .query('INSERT INTO Bugs (Title, Description, Status, Priority, ProjectID, ReportedBy, AssignedTo) OUTPUT INSERTED.* VALUES (@title, @description, @status, @priority, @projectID, @reportedBy, @assignedTo)');
      return result.recordset[0];
    } catch (error) {
      console.error('Error creating bug:', error);
      throw error;
    }
  }

  // Update bug
  static async updateBug(bugId: number, bugData: UpdateBug): Promise<Bug | null> {
    try {
      const updateFields: string[] = [];
      let paramIndex = 1;

      const request = (await getPool()).request();

      if (bugData.Title) {
        updateFields.push(`Title = @p${paramIndex}`);
        request.input(`p${paramIndex++}`, bugData.Title);
      }
      if (bugData.Description !== undefined) {
        updateFields.push(`Description = @p${paramIndex}`);
        request.input(`p${paramIndex++}`, bugData.Description);
      }
      if (bugData.Status) {
        updateFields.push(`Status = @p${paramIndex}`);
        request.input(`p${paramIndex++}`, bugData.Status);
      }
      if (bugData.Priority) {
        updateFields.push(`Priority = @p${paramIndex}`);
        request.input(`p${paramIndex++}`, bugData.Priority);
      }
      if (bugData.AssignedTo !== undefined) {
        updateFields.push(`AssignedTo = @p${paramIndex}`);
        request.input(`p${paramIndex++}`, bugData.AssignedTo);
      }

      if (updateFields.length === 0) {
        throw new Error('No fields to update');
      }

      request.input(`p${paramIndex}`, bugId);

      const query = `
        UPDATE Bugs
        SET ${updateFields.join(', ')}
        OUTPUT INSERTED.*
        WHERE BugID = @p${paramIndex}
      `;

      const result = await request.query(query);
      return result.recordset[0] || null;
    } catch (error) {
      console.error('Error updating bug:', error);
      throw error;
    }
  }

  // Delete bug
  static async deleteBug(bugId: number): Promise<boolean> {
    try {
      const pool: sql.ConnectionPool = await getPool();
      const result = await pool.request()
        .input('bugId', bugId)
        .query('DELETE FROM Bugs WHERE BugID = @bugId');
      return result.rowsAffected[0] > 0;
    } catch (error) {
      console.error('Error deleting bug:', error);
      throw error;
    }
  }
}