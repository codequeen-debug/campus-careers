# Campus Careers
A HigherEdJobs-Style Full-Stack Web Application

# Live Links
Frontend (Live App): https://campus-careers-roan.vercel.app/
Backend API: [add Render/Railway link here]
GitHub Repository: https://github.com/codequeen-debug/campus-careers

# Login
SEEKER
JessicaBrown
you@university.edu
123456

RECRUITED (APPROVED)
Mary Jane
you@workplace.org
123456

ADMIN
Parker Johnson
you@admin.org
123456




# Project Overview

Campus Careers is a full-stack web application inspired by platforms such as HigherEdJobs. It is designed to simulate a real-world academic job board where universities and institutions can post job opportunities and applicants can search and apply for roles.

The system supports three distinct user roles:

Admin
Recruiter / Employer
Job Seeker

Each role has different permissions and dashboards, implementing role-based access control (RBAC), authentication, and full CRUD functionality.

The application demonstrates integration of:

React frontend
Node.js + Express backend
Firebase authentication
MongoDB database
RESTful API design
System architecture principles

# Problem Statement

Universities need centralized platforms to manage academic and administrative job postings. Existing solutions like HigherEdJobs are complex, so this project builds a simplified but functional system that allows:

Recruiters to manage job listings
Job seekers to browse and apply for jobs
Admins to monitor system activity
User Roles & Permissions
 Admin
Manage all users
View all job postings
Remove inappropriate content
Disable recruiter/job seeker accounts
Monitor system activity
 Recruiter / Employer
Create company profiles
Post new jobs
Edit/delete job listings
View applicants per job

Our Job Seeker:
Create and manage profile
Browse and filter jobs
Apply for jobs
Track applications

#Communication
<img width="79<img width="1179" height="2556" alt="IMG_5829" src="https://github.com/user-attachments/assets/05d37954-9e85-40ed-b197-24b37ec51912" />
9" height="756" alt="IMG_5831" src="https://github.com/user-attachments/assets/505c2e2f-5da8-4d09-b8e3-a82db7368b3e" />


# Component Architecture
[ React Frontend ]
   ├── Pages (Home, Jobs, Dashboards)
   ├── Components (Navbar, Cards, Forms)
   ├── Context API (AuthContext)
   └── Protected Routes

           ↓ API Calls

[ Express Backend ]
   ├── Auth Middleware
   ├── Jobs Routes
   ├── Applications Routes
   └── User Routes

           ↓

[ MongoDB ]
   ├── users collection
   ├── jobs collection
   └── applications collection
   
Use Case Diagram
                +----------------+
                |     Admin      |
                +----------------+
                 /      |       \
      manage users   manage jobs   view system stats

                +----------------+
                |   Recruiter    |
                +----------------+
                 /        \
        create jobs     view applicants

                +----------------+
                |  Job Seeker    |
                +----------------+
                 /        \
           browse jobs   apply to jobs
           

# Development Stages
Stage 1: Frontend + Firebase Auth
Login/Register system
Role-based routing
UI dashboards
Mock job data
Stage 2: Backend API (Express)
CRUD routes
Connect frontend to backend
In-memory or JSON data
Stage 3: MongoDB Integration
Persistent database storage
Real job/application tracking
Full backend integration

# Challenges we faced
Git repository conflicts during multi-folder structure setup
Handling nested server/ Git issues (submodule problem)
Deploying backend separately from frontend
Fixing authentication and API connection issues
Managing environment variables in production

# Key Features
Role-based authentication system
Job search and filtering
Job application tracking
Recruiter job management dashboard
Admin control panel
Responsive UI
REST API integration

# Future Improvements
Email notifications for applications
Pagination and search optimization
Dark mode UI
JWT-based authentication 

# Learning Outcomes

This project demonstrates:

Full-stack development workflow
Authentication systems (Firebase)
REST API design
Database modeling (MongoDB)
Frontend-backend integration
Git and deployment workflows
Real-world system design thinking
