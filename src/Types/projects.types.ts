export interface Project {
  ProjectID: number;
  ProjectName: string;
  Description: string | null;
  CreatedBy: number;
  CreatedAt: Date;
}

export interface CreateProject {
  ProjectName: string;
  Description?: string;
  CreatedBy: number;
}

export interface UpdateProject {
  ProjectName?: string;
  Description?: string;
}

export interface ProjectMember {
  ID: number;
  ProjectID: number;
  UserID: number;
  RoleInProject: string;
}

export interface CreateProjectMember {
  ProjectID: number;
  UserID: number;
  RoleInProject?: string;
}