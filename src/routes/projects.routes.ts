import type { Express } from "express";
import * as projectController from "../controllers/project.controller";
import { authenticateJWT } from "../middleware/auth.middleware";
import { authorizeRole } from "../middleware/role.middleware";

const projectRoutes = (app:Express) => {
    // GET /projects - Retrieve all projects
    app.get('/projects', projectController.getAllProjectsController);

    // GET /projects/:id - Retrieve a specific project by ID
    app.get('/projects/:id', projectController.getProjectByIdController);

    // GET /projects/creator/:creatorId - Retrieve projects by creator
    app.get('/projects/creator/:creatorId', projectController.getProjectsByCreatorController);

    // GET /projects/member/:userId - Retrieve projects by member
    app.get('/projects/member/:userId', projectController.getProjectsByMemberController);

    // POST /projects - Create a new project (Admin only)
    app.post('/projects', authenticateJWT, authorizeRole('admin'), projectController.createProjectController);

    // PUT /projects/:id - Update an existing project
    app.put('/projects/:id', projectController.updateProjectController);

    // DELETE /projects/:id - Delete a project
    app.delete('/projects/:id', projectController.deleteProjectController);
}

export default projectRoutes;