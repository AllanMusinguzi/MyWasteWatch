# mywastewatch-mongodb-dockerized Documentation

## Overview
MyWasteWatch is an application designed to monitor and manage waste effectively. This documentation provides an extensive overview of the system architecture, setup instructions, and troubleshooting tips.

## System Architecture
The system is composed of two main services, orchestrated using Docker and Docker Compose:

1. **MongoDB Service**: 
   - **Purpose**: Acts as the primary database for storing application data.
   - **Image**: Utilizes the official `mongo:latest` Docker image.
   - **Ports**: Exposes port `27017` for database access.
   - **Volumes**: Uses a Docker volume for persistent data storage.

2. **Node.js Application Service**:
   - **Purpose**: The core application service, built with Node.js and the Express.js framework.
   - **Build Context**: Includes the application source code and dependencies.
   - **Ports**: Exposes port `3000` for accessing the web application.
   - **Environment Variables**: Requires a `MONGO_URI` environment variable for database connection.
   - **Dependencies**: Depends on the MongoDB service for database operations.

### Docker Compose
The `docker-compose.yml` file defines the services, volumes, and dependencies. The MongoDB service is configured to start first, followed by the Node.js application service, which depends on MongoDB being ready.

### Dockerfile
The `Dockerfile` specifies the build instructions for the Node.js application, including setting the working directory, copying necessary files, installing dependencies, and defining the startup command.

## Project Structure
The project is organized into several directories and files to maintain a clean and manageable codebase:

- **`app.js`**: The main entry point of the application, responsible for initializing the Express.js server and connecting to MongoDB.
- **`config/db.js`**: Contains the database connection logic, including functions to connect to MongoDB and retrieve the database instance.
- **`controllers/`**: Directory for controller files, which handle the application logic for different routes and endpoints.
- **`Dockerfile`**: The Dockerfile for building the Node.js application container.
- **`docker-compose.yml`**: Docker Compose configuration file for defining and running the multi-container application.
- **`models/`**: Directory for Mongoose models, defining the schema and structure of the application data.
- **`package.json`**: Lists the project dependencies and scripts.
- **`public/views/`**: Directory for storing view templates (e.g., EJS templates) used by the Express.js application.
- **`routes/`**: Directory for route files, defining the application's API endpoints.
- **`.env` (optional)**: Environment file for storing sensitive configuration variables like `MONGO_URI`.

## Environment Variables
The application requires specific environment variables to function correctly. These variables can be set in a `.env` file located at the root of the project. 

- **`MONGO_URI`**: The MongoDB connection string, which specifies the address and database name to connect to.

### Example `.env` File
An example `.env` file might look like this:
```
MONGO_URI=mongodb://mongo:27017/mydatabase
```
Ensure that the `MONGO_URI` matches the format expected by the MongoDB connection library.

## Running the Application
To start and run the MyWasteWatch application, follow these steps:

1. **Clone the Repository**:
   - Use `git clone` to clone the repository to your local machine.
   - Navigate to the project directory using `cd MyWasteWatch`.

2. **Build and Run the Docker Containers**:
   - Use the `docker-compose up --build` command to build the Docker images and start the containers.
   - This command will download the necessary images, build the application container, and start both the MongoDB and Node.js services.

3. **Access the Application**:
   - Once the services are running, the application will be accessible at `http://localhost:3000`.


By following this documentation, you should be able to set up, run, and troubleshoot the MyWasteWatch application effectively. If you encounter any additional issues or have further questions, refer to the project's source code and configuration files for more details.
