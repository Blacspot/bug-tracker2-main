export interface Bug {
  BugID: number;
  Title: string;
  Description: string | null;
  Status: string;
  Priority: string;
  ProjectID: number;
  ReportedBy: number | null;
  AssignedTo: number | null;
  CreatedAt: Date;
}

export interface CreateBug {
  Title: string;
  Description?: string;
  Status?: string;
  Priority?: string;
  ProjectID: number;
  ReportedBy?: number;
  AssignedTo?: number;
}

export interface UpdateBug {
  Title?: string;
  Description?: string;
  Status?: string;
  Priority?: string;
  AssignedTo?: number;
}