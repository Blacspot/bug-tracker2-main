import { getAllUsers } from './user.services';
import { getAllProjects } from './projects.services';
import { getAllBugs } from './bug.services';
import { User } from '../Types/user.types';
import { Project } from '../Types/projects.types';
import { Bug } from '../Types/bugs.types';

interface DashboardBug {
  id: number;
  title: string;
  status: string;
  priority: string;
  projectId: number;
  createdAt: string;
  assignedTo: number | null;
  comments: any[];
}

interface DashboardUser {
  id: number;
  name: string;
  role: string;
}

interface DashboardProject {
  id: number;
  name: string;
}

interface DashboardData {
  bugs: DashboardBug[];
  projects: DashboardProject[];
  users: DashboardUser[];
}

export const getDashboardData = async (): Promise<DashboardData> => {
  try {
    const [users, projects, bugs] = await Promise.all([
      getAllUsers(),
      getAllProjects(),
      getAllBugs()
    ]);

    const formattedBugs: DashboardBug[] = bugs.map(bug => ({
      id: bug.BugID,
      title: bug.Title,
      status: bug.Status.toLowerCase().replace(' ', '-'),
      priority: bug.Priority.toLowerCase(),
      projectId: bug.ProjectID,
      createdAt: bug.CreatedAt.toISOString().split('T')[0],
      assignedTo: bug.AssignedTo,
      comments: new Array(bug.CommentCount || 0).fill({})
    }));

    const formattedUsers: DashboardUser[] = users.map(user => ({
      id: user.UserID,
      name: user.Username,
      role: user.Role
    }));

    const formattedProjects: DashboardProject[] = projects.map(project => ({
      id: project.ProjectID,
      name: project.ProjectName
    }));

    return {
      bugs: formattedBugs,
      projects: formattedProjects,
      users: formattedUsers
    };
  } catch (error: any) {
    console.error('Error fetching dashboard data:', error);
    throw error;
  }
};