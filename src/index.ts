import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import { getPool } from '../db/config';
import bugRoutes from './routes/bug.routes';
import commentRoutes from './routes/comments.routes';
import projectRoutes from './routes/projects.routes';
import userRoutes from './routes/user.routes';

const  app = express();
dotenv.config();

const allowedOrigins = [
  "http://localhost:5173",
  "https://bug-tracker-frontend-phi.vercel.app"
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
}));

app.options(/.*/, cors());
 // Enable pre-flight for all routes


// Middleware
app.use(express.json());



const PORT = process.env.PORT || 8081;


// Routes
bugRoutes(app);
commentRoutes(app);
projectRoutes(app);
userRoutes(app);

// Root route
app.get('/', (req, res) => {
    res.json({
        message: "Bug Tracker API is running",
        version: "1.0.0",
        endpoints: {
            bugs: "/bugs",
            comments: "/comments",
            projects: "/projects",
            users: "/users"
        }
    });
});

app.listen(PORT, async () => {
    console.log("Starting server...");
    try {
        const dbConnected = await getPool();
        if(dbConnected){
            console.log(`Server is running on http://localhost:${PORT}`);
            console.log("Database connected Successfully");
        }
        else{
            console.log("Database connection error");
        }
    } catch (error) {
        console.log("Error starting the server", error);
    }
});
