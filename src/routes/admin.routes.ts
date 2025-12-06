// routes/admin.routes.ts
import { Router } from 'express';
import { authenticateJWT } from '../middleware/auth.middleware';
import { authorizeRole } from '../middleware/role.middleware';
import { getAllUsers, deleteUser } from '../services/user.services';
import { getAllProjects, deleteProject } from '../services/projects.services';
import { getAllBugs, deleteBug } from '../services/bug.services';
import { createProjectController } from '../controllers/project.controller';

const router = Router();

// Admin-only: Get all users
router.get('/users', authenticateJWT, authorizeRole('admin'), async (req, res) => {
  try {
    const users = await getAllUsers();
    res.json(users);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Admin-only: Delete user
router.delete('/users/:id', authenticateJWT, authorizeRole('admin'), async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const success = await deleteUser(userId);
    if (!success) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Admin-only: Get all projects
router.get('/projects', authenticateJWT, authorizeRole('admin'), async (req, res) => {
  try {
    const projects = await getAllProjects();
    res.json(projects);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Admin-only: Create project
router.post('/projects', authenticateJWT, authorizeRole('admin'), createProjectController);

// Admin-only: Delete project
router.delete('/projects/:id', authenticateJWT, authorizeRole('admin'), async (req, res) => {
  try {
    const projectId = parseInt(req.params.id);
    const success = await deleteProject(projectId);
    if (!success) return res.status(404).json({ message: 'Project not found' });
    res.json({ message: 'Project deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Admin-only: Get all bugs
router.get('/bugs', authenticateJWT, authorizeRole('admin'), async (req, res) => {
  try {
    const bugs = await getAllBugs();
    res.json(bugs);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Admin-only: Delete bug
router.delete('/bugs/:id', authenticateJWT, authorizeRole('admin'), async (req, res) => {
  try {
    const bugId = parseInt(req.params.id);
    const success = await deleteBug(bugId);
    if (!success) return res.status(404).json({ message: 'Bug not found' });
    res.json({ message: 'Bug deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
