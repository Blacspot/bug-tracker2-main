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