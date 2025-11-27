# Bug Tracker Backend API

A comprehensive Node.js/Express backend for a bug tracking system built with TypeScript, SQL Server, and following clean architecture principles.

## 🏗️ Architecture Overview

The backend follows a layered architecture pattern with clear separation of concerns:

```
┌─────────────────┐
│   Controllers   │ ← HTTP request/response handling
├─────────────────┤
│    Services     │ ← Business logic & validation
├─────────────────┤
│  Repositories   │ ← Database operations
├─────────────────┤
│     Types       │ ← TypeScript interfaces
└─────────────────┘
```

## 📁 Project Structure

```
src/
├── controllers/          # HTTP request handlers
│   ├── bug.controller.ts
│   ├── comment.controller.ts
│   ├── project.controller.ts
│   └── user.controller.ts
├── services/            # Business logic layer
│   ├── bug.services.ts
│   ├── comments.services.ts
│   ├── projects.services.ts
│   └── user.services.ts
├── repositories/        # Data access layer
│   ├── bugs.repositories.ts
│   ├── comments.repositories.ts
│   ├── projects.repositories.ts
│   └── user.repositories.ts
├── Types/              # TypeScript type definitions
│   ├── bugs.types.ts
│   ├── comments.types.ts
│   ├── projects.types.ts
│   └── user.types.ts
├── middleware/         # Express middleware
│   └── auth.middleware.ts
├── routes/            # Route definitions
├── utils/             # Utility functions
│   └── errorHandler.ts
└── index.ts           # Application entry point

db/
├── config.ts          # Database connection configuration
└── scripts/
    └── data.sql       # Database schema and seed data
```

## 🔄 Request Flow

### 1. HTTP Request → Controller
```typescript
// Example: POST /bugs
export const createBugController = async (req: Request, res: Response) => {
    try {
        const bugData = req.body;           // Extract request data
        const bug = await createBug(bugData); // Call service
        res.status(201).json({ bug });      // Return response
    } catch (error: any) {
        handleControllerError(error, res);   // Handle errors
    }
};
```

### 2. Controller → Service (Business Logic)
```typescript
export const createBug = async (bugData: any): Promise<Bug> => {
    try {
        const validatedData = validateCreateBugData(bugData); // Validate input
        return await BugRepository.createBug(validatedData);  // Call repository
    } catch (error) {
        console.error('Error in createBug service:', error);
        throw error;
    }
};
```

### 3. Service → Repository (Database Operations)
```typescript
static async createBug(bugData: CreateBug): Promise<Bug> {
    try {
        const pool = await getPool();
        const result = await pool.request()
            .input("title", bugData.Title)
            .input("description", bugData.Description || null)
            .query(`
                INSERT INTO Bugs (Title, Description, Status, Priority, ProjectID, ReportedBy, AssignedTo)
                OUTPUT INSERTED.*
                VALUES (@title, @description, @status, @priority, @projectID, @reportedBy, @assignedTo)
            `);
        return result.recordset[0];
    } catch (error) {
        console.error('Error creating bug:', error);
        throw error;
    }
}
```

## 🗄️ Database Schema

### Core Entities

#### Users
- **UserID**: Primary key (auto-increment)
- **Username**: Unique username
- **Email**: Unique email address
- **PasswordHash**: Hashed password
- **Role**: User role (Admin, Developer, etc.)
- **CreatedAt**: Timestamp

#### Projects
- **ProjectID**: Primary key (auto-increment)
- **ProjectName**: Project name
- **Description**: Optional project description
- **CreatedBy**: Foreign key to Users
- **CreatedAt**: Timestamp

#### Bugs
- **BugID**: Primary key (auto-increment)
- **Title**: Bug title
- **Description**: Optional bug description
- **Status**: Bug status (Open, In Progress, Resolved)
- **Priority**: Bug priority (Low, Medium, High, Critical)
- **ProjectID**: Foreign key to Projects
- **ReportedBy**: Foreign key to Users (nullable)
- **AssignedTo**: Foreign key to Users (nullable)
- **CreatedAt**: Timestamp

#### Comments
- **CommentID**: Primary key (auto-increment)
- **BugID**: Foreign key to Bugs (CASCADE on delete)
- **UserID**: Foreign key to Users
- **CommentText**: Comment content
- **CreatedAt**: Timestamp

## 🔐 Authentication & Authorization

### JWT Token Flow
1. **Login**: User provides email/password
2. **Verification**: Service validates credentials against database
3. **Token Generation**: JWT created with user ID, email, and role
4. **Middleware**: Subsequent requests validated using auth middleware

### Middleware Usage
```typescript
// Protected route example
router.get('/projects', authenticateToken, getAllProjectsController);
```

## 📡 API Endpoints

### Users
- `POST /users` - Create user
- `POST /users/login` - User login
- `GET /users/profile` - Get user profile
- `PUT /users/profile` - Update user profile
- `PUT /users/change-password` - Change password

### Projects
- `GET /projects` - Get all projects
- `GET /projects/:id` - Get project by ID
- `GET /projects/creator/:creatorId` - Get projects by creator
- `POST /projects` - Create project
- `PUT /projects/:id` - Update project
- `DELETE /projects/:id` - Delete project

### Bugs
- `GET /bugs` - Get all bugs
- `GET /bugs/:id` - Get bug by ID
- `GET /bugs/project/:projectId` - Get bugs by project
- `GET /bugs/assignee/:assigneeId` - Get bugs by assignee
- `GET /bugs/reporter/:reporterId` - Get bugs by reporter
- `GET /bugs/status/:status` - Get bugs by status
- `POST /bugs` - Create bug
- `PUT /bugs/:id` - Update bug
- `DELETE /bugs/:id` - Delete bug

### Comments
- `GET /comments` - Get all comments
- `GET /comments/:id` - Get comment by ID
- `GET /comments/bug/:bugId` - Get comments by bug
- `GET /comments/user/:userId` - Get comments by user
- `POST /comments` - Create comment
- `PUT /comments/:id` - Update comment
- `DELETE /comments/:id` - Delete comment
- `DELETE /comments/bug/:bugId` - Delete comments by bug

## 🛡️ Data Validation & Business Rules

### Bug Creation Rules
- Title is required and must be non-empty
- ProjectID must reference an existing project
- Status defaults to 'Open'
- Priority defaults to 'Medium'
- ReportedBy and AssignedTo are optional

### Comment Rules
- BugID must reference an existing bug
- UserID must reference an existing user
- CommentText is required and cannot be empty
- Comments are immutable except for text content

### Project Rules
- ProjectName is required and unique
- CreatedBy must reference an existing user
- Description is optional

## 🔄 Error Handling

### Centralized Error Handler
```typescript
export const handleControllerError = (error: any, res: Response) => {
    console.error('Controller error:', error);

    // Database errors
    if (error.code === 'EREQUEST') {
        return res.status(400).json({
            message: 'Database error',
            error: error.message
        });
    }

    // Validation errors
    if (error.message.includes('required') || error.message.includes('must be')) {
        return res.status(400).json({
            message: 'Validation error',
            error: error.message
        });
    }

    // Default server error
    res.status(500).json({
        message: 'Internal server error',
        error: error.message
    });
};
```

### Error Response Format
```json
{
    "message": "Error description",
    "error": "Detailed error message"
}
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16+)
- SQL Server
- npm or pnpm

### Installation
```bash
# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env

# Configure database connection in .env
DB_SERVER=your-server
DB_DATABASE=your-database
DB_USER=your-username
DB_PASSWORD=your-password

# Run database setup
# Execute db/scripts/data.sql in SQL Server

# Start development server
pnpm run dev
```

### Environment Variables
```env
DB_SERVER=localhost
DB_DATABASE=bugtracker
DB_USER=sa
DB_PASSWORD=yourpassword
JWT_SECRET=your-jwt-secret
PORT=3000
```

## 🧪 Testing the API

### Using cURL Examples

```bash
# Create a user
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{"Username":"testuser","Email":"test@example.com","Password":"password123"}'

# Login
curl -X POST http://localhost:3000/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Create a project (include JWT token)
curl -X POST http://localhost:3000/projects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"ProjectName":"Test Project","Description":"A test project","CreatedBy":1}'
```

## 🔧 Development Guidelines

### Code Style
- Use TypeScript for type safety
- Follow JSDoc commenting standards
- Implement proper error handling
- Use async/await for asynchronous operations
- Validate all inputs at service layer

### Database Best Practices
- Use parameterized queries to prevent SQL injection
- Implement proper foreign key constraints
- Use transactions for multi-table operations
- Index frequently queried columns

### Security Considerations
- Hash passwords using bcrypt
- Use JWT for authentication
- Validate all user inputs
- Implement proper CORS settings
- Use HTTPS in production

## 📊 Performance Considerations

### Database Optimization
- Connection pooling with mssql
- Proper indexing on foreign keys
- Efficient query patterns
- Minimal data transfer

### Caching Strategy
- Consider Redis for session storage
- Cache frequently accessed data
- Implement proper cache invalidation

### Monitoring
- Log errors and performance metrics
- Monitor database connection health
- Track API response times
- Implement health check endpoints

## 🔄 Data Flow Examples

### Creating a Bug
1. **Client** sends POST /bugs with bug data
2. **Controller** extracts request body
3. **Service** validates data and business rules
4. **Repository** executes INSERT query with OUTPUT
5. **Database** returns created record
6. **Repository** returns data to service
7. **Service** returns data to controller
8. **Controller** sends 201 response with bug data

### Fetching Project Bugs
1. **Client** requests GET /bugs/project/123
2. **Controller** parses projectId parameter
3. **Service** validates projectId exists
4. **Repository** executes SELECT with JOIN
5. **Database** returns bug records
6. **Repository** returns array of bugs
7. **Service** returns data to controller
8. **Controller** sends 200 response with bug array

This architecture ensures maintainable, scalable, and secure backend code with clear separation of concerns and comprehensive error handling.