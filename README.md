

# Task Management Application

This repository implements a task management application with a backend built in Node.js (Express + TypeScript) using PostgreSQL, and a frontend built in React with TypeScript.

## Table of Contents
- [Overview](#overview)
- [Backend Setup](#backend-setup)
  - [Database Setup](#database-setup)
  - [Environment Variables for Backend](#environment-variables-for-backend)
  - [Running the Backend](#running-the-backend)
- [Frontend Setup](#frontend-setup)
  - [Environment Variables for Frontend](#environment-variables-for-frontend)
  - [Running the Frontend](#running-the-frontend)
- [Testing](#testing)
- [Salary Expectations](#salary-expectations)
- [Additional Notes](#additional-notes)

## Overview

This project provides a basic Task Management system with the following features:

- **User Authentication:**
  - **Register:** Users can register with a username and password. Passwords are hashed using bcrypt.
  - **Login:** Registered users log in to receive a JWT token.

- **Task Management:**
  - All CRUD operations (Create, Read, Update, Delete) for tasks are available.
  - Task endpoints are protected by authentication (JWT).

The project is intentionally minimal yet functional, and it leverages environment variables for configuration.

---

## Backend Setup

### Database Setup

1. **Install PostgreSQL**
   - If you do not have PostgreSQL installed, download and install it from the [PostgreSQL Downloads](https://www.postgresql.org/download/) page.

2. **Create a Database and User**

   Open your terminal and log in as the `postgres` superuser:

   ```bash
   psql -U postgres
   ```

   In the psql prompt, run the following commands:

   ```sql
   -- Create a new user
   CREATE USER task_user WITH PASSWORD 'task_password';

   -- Create a new database
   CREATE DATABASE task_manager;

   -- Grant privileges on the new database to the user
   GRANT ALL PRIVILEGES ON DATABASE task_manager TO task_user;
   ```

   Then exit psql by typing:

   ```bash
   \q
   ```

3. **Create the Required Tables**

   Connect to your new database using the newly created user:

   ```bash
   psql -U task_user -d task_manager
   ```

   Then run the following SQL commands:

   ```sql
   -- Create the users table
   CREATE TABLE users (
     id SERIAL PRIMARY KEY,
     username VARCHAR(255) UNIQUE NOT NULL,
     password VARCHAR(255) NOT NULL
   );

   -- Create the tasks table
   CREATE TABLE tasks (
     id SERIAL PRIMARY KEY,
     title VARCHAR(255) NOT NULL,
     description TEXT,
     is_complete BOOLEAN DEFAULT false,
     user_id INTEGER REFERENCES users(id)
   );
   ```

   Exit psql by typing:

   ```bash
   \q
   ```

### Environment Variables for Backend

Create a `.env` file in the backend root directory with the following content:

```plaintext
PORT=5020
DATABASE_URL=postgresql://task_user:task_password@localhost:5432/task_manager
JWT_SECRET=your_jwt_secret_here
```

**Note:** Replace `your_jwt_secret_here` with a secure secret string of your choice.

### Running the Backend

1. **Install dependencies:**

   In your backend directory, run:

   ```bash
   npm install
   ```

2. **Run the backend server:**

   To start the backend server, run:

   ```bash
   npm run dev
   ```

   The server should start and run on [http://localhost:5020](http://localhost:5020).

## Frontend Setup

### Environment Variables for Frontend

In the frontend project directory (e.g., `task-manager-frontend`), create a `.env` file with the following content:

```plaintext
REACT_APP_API_URL=http://localhost:5020
```

### Running the Frontend

1. **Install dependencies:**

   In your frontend directory, run:

   ```bash
   npm install
   ```

2. **Start the React development server:**

   To start the frontend, run:

   ```bash
   npm start
   ```

   The app should open in your browser at [http://localhost:3000](http://localhost:3000).

## Testing

- **Backend Testing:**
  Use Postman (or a similar tool) to test API endpoints. Ensure you include the JWT token in the Authorization header (format: Bearer `<token>`) for protected routes.

- **Frontend Testing:**
  The React application allows you to register, log in, and perform CRUD operations on tasks. Once logged in, test creating, updating (toggling completion), and deleting tasks using the UI.

## Salary Expectations

- **Full-Time Positions:**  
  Salary expectations are in the range of $90,000 to $120,000 per year.

- **Internships:**  
  Hourly compensation is expected to be around $20 to $30 per hour.

These figures reflect market standards for similar roles and responsibilities.

## Additional Notes

- **Code Quality & Structure:**
  - The backend is written in TypeScript with clear separation of concerns (authentication middleware, CRUD endpoints).
  - The frontend is organized into a few components (AuthForm, Tasks, and the main App), making the project maintainable.

- **Environment Variables:**  
  All sensitive and configurable information is stored in `.env` files, reducing hard-coded values in the codebase.

- **Extensibility:**  
  Although the project is minimal, its structure allows for easy extension (e.g., splitting the backend into controllers/services, adding more features in the frontend, etc.).

Feel free to reach out if you have any questions or need further assistance with the setup.

Happy coding!