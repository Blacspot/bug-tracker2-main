/*
====================================================
 SAFE RESET + JIRA-STYLE BUG TRACKER DATABASE (MSSQL)
====================================================
- Drops all tables safely
- Recreates all tables cleanly
- Enforces Admin vs User permissions
- Adds Project Members (Jira behavior)
- Adds Email Verification fields
- Inserts full realistic seed data
*/

-----------------------------
-- DROP TABLES IN FK ORDER
-----------------------------
DROP TABLE IF EXISTS Comments;
DROP TABLE IF EXISTS Bugs;
DROP TABLE IF EXISTS ProjectMembers;
DROP TABLE IF EXISTS Projects;
DROP TABLE IF EXISTS Users;


-----------------------------
-- USERS TABLE
-----------------------------
CREATE TABLE Users (
    UserID INT IDENTITY(1,1) PRIMARY KEY,
    Username VARCHAR(100) NOT NULL,
    Email VARCHAR(150) UNIQUE NOT NULL,
    PasswordHash VARCHAR(255) NOT NULL,
    Role VARCHAR(50) DEFAULT 'user', -- admin | developer | qa | user
    IsVerified BIT DEFAULT 0,
    VerificationCode VARCHAR(6),
    CodeExpiry DATETIME,
    CreatedAt DATETIME DEFAULT GETDATE()
);


-----------------------------
-- PROJECTS TABLE (Admin Creates)
-----------------------------
CREATE TABLE Projects (
    ProjectID INT IDENTITY(1,1) PRIMARY KEY,
    ProjectName VARCHAR(150) NOT NULL,
    Description VARCHAR(MAX),
    CreatedBy INT NOT NULL, -- Admin ID
    CreatedAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (CreatedBy) REFERENCES Users(UserID)
);


-----------------------------
-- PROJECT MEMBERS (JIRA CORE)
-----------------------------
CREATE TABLE ProjectMembers (
    ID INT IDENTITY(1,1) PRIMARY KEY,
    ProjectID INT NOT NULL,
    UserID INT NOT NULL,
    RoleInProject VARCHAR(50) DEFAULT 'Member',

    FOREIGN KEY (ProjectID) REFERENCES Projects(ProjectID) ON DELETE CASCADE,
    FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE,

    CONSTRAINT UQ_ProjectUser UNIQUE (ProjectID, UserID)
);


-----------------------------
-- BUGS TABLE
-----------------------------
CREATE TABLE Bugs (
    BugID INT IDENTITY(1,1) PRIMARY KEY,
    Title VARCHAR(200) NOT NULL,
    Description VARCHAR(MAX),
    Status VARCHAR(50) DEFAULT 'Open',       -- Open | In Progress | Resolved
    Priority VARCHAR(50) DEFAULT 'Medium',  -- Low | Medium | High | Critical
    ProjectID INT NOT NULL,
    ReportedBy INT NOT NULL,
    AssignedTo INT NULL,
    CreatedAt DATETIME DEFAULT GETDATE(),

    FOREIGN KEY (ProjectID) REFERENCES Projects(ProjectID) ON DELETE CASCADE,
    FOREIGN KEY (ReportedBy) REFERENCES Users(UserID),
    FOREIGN KEY (AssignedTo) REFERENCES Users(UserID)
);


-----------------------------
-- COMMENTS TABLE
-----------------------------
CREATE TABLE Comments (
    CommentID INT IDENTITY(1,1) PRIMARY KEY,
    BugID INT NOT NULL,
    UserID INT NOT NULL,
    CommentText VARCHAR(MAX) NOT NULL,
    CreatedAt DATETIME DEFAULT GETDATE(),

    FOREIGN KEY (BugID) REFERENCES Bugs(BugID) ON DELETE CASCADE,
    FOREIGN KEY (UserID) REFERENCES Users(UserID)
);


-----------------------------
-- SEED USERS (WITH BCRYPT)
-----------------------------
INSERT INTO Users (Username, Email, PasswordHash, Role, IsVerified)
VALUES
('LukeMbogo', 'luke@example.com', '$2b$10$wgDVqgCejackN3xN65SQNOESZ/kt5MCzuiFOo6svUjj3aEJ0Sg0hK', 'admin', 1),
('JaneDoe', 'jane@example.com', '$2b$10$8y3BnspYYVkRmZrxldBQBO1AM0CQZVqLSNHSa5r/iv3uEYMK4UreW', 'developer', 1),
('JohnDev', 'john@example.com', '$2b$10$P6/huKYGMapWko9I04qMveQRkQISFRLwMuWWGOPX1YgJL034M57Ou', 'tester', 1),
('SarahQA', 'sarah@example.com', '$2b$10$pwYhqZoYJ2oN8/41BGWeNe.ci.fUQkpNKRl6PlI0E/v3f7XGynNTe', 'qa engineer', 1);


-----------------------------
-- SEED PROJECTS (ADMIN CREATED)
-----------------------------
INSERT INTO Projects (ProjectName, Description, CreatedBy)
VALUES
('E-Farm', 'AI-powered digital farming management system', 1),
('Autofix', 'Garage and mechanic booking platform', 1),
('SportsHub', 'Athlete management and event tracking system', 1);


-----------------------------
-- ASSIGN USERS TO PROJECTS
-----------------------------
INSERT INTO ProjectMembers (ProjectID, UserID, RoleInProject)
VALUES
(1, 2, 'Developer'),
(1, 3, 'Tester'),
(1, 4, 'QA'),

(2, 2, 'Developer'),
(2, 4, 'QA'),

(3, 3, 'Developer'),
(3, 4, 'QA');


-----------------------------
-- SEED BUGS
-----------------------------
INSERT INTO Bugs (Title, Description, Status, Priority, ProjectID, ReportedBy, AssignedTo)
VALUES
('Login button not responding', 'Users cannot log in after pressing the button', 'Open', 'High', 1, 1, 2),
('Broken image on homepage', 'Hero section image fails to load intermittently', 'In Progress', 'Medium', 1, 3, 2),
('Payment gateway timeout', 'Transaction API returns 504 Gateway Timeout', 'Open', 'Critical', 2, 2, 1),
('Dashboard crash on load', 'Uncaught exception when loading user dashboard', 'Resolved', 'High', 3, 4, 3);


-----------------------------
-- SEED COMMENTS
-----------------------------
INSERT INTO Comments (BugID, UserID, CommentText)
VALUES
(1, 2, 'Investigating login button issue.'),
(2, 4, 'Image cache cleared, monitoring.'),
(3, 1, 'Raised with payments team.'),
(4, 3, 'Patch deployed, verify.');


-----------------------------
-- QUICK VERIFICATION
-----------------------------
SELECT * FROM Users;
SELECT * FROM Projects;
SELECT * FROM ProjectMembers;
SELECT * FROM Bugs;
SELECT * FROM Comments;
