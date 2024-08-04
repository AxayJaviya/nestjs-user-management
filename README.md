# nestjs-user-management
RESTful APIs for managing user registration, authentication, and profile management using Node.js and NestJS.

## Prerequisites
- **Node.js**: Ensure you have Node.js installed. You can download it from [nodejs.org](https://nodejs.org/).

## Installation
1. **Clone the repository:**
    ```
    git clone https://github.com/AxayJaviya/nestjs-user-management.git
    cd nestjs-user-management/backend
    ```
2. **Install dependencies:**
    ```
    npm install
    ```

## Configuration

### Environment Variables

1. **Local Development:**
    - Create a `.env.development` file in the `backend` folder with the following content:
    ```env
    # Database
    POSTGRES_DB=user-management
    POSTGRES_USER=username
    POSTGRES_PASSWORD=password
    
    # For Application running via npm run start:dev
    DATABASE_URL=postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@localhost:5432/${POSTGRES_DB}?schema=public
    
    # JWT
    JWT_TOKEN_SECRET="G6a9D3@pL!vZ2k#s8T1wX$yM5qF7uB^eP0nJ4rH"
    ```
2. **Using Docker Compose:**
    - Ensure Docker and Docker Compose are installed.
    - Docker Compose will automatically pick up the `.env.development` file in the `backend` folder.
    - Create or update the `.env.development` file with the following content:
    ```env
    # Database
    POSTGRES_DB=user-management
    POSTGRES_USER=username
    POSTGRES_PASSWORD=password
    
    # For Application running via Docker Compose
    DATABASE_URL=postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:5432/${POSTGRES_DB}?schema=public
    
    # JWT
    JWT_TOKEN_SECRET="G6a9D3@pL!vZ2k#s8T1wX$yM5qF7uB^eP0nJ4rH"
    ```

## Running the Application

1. **Locally (Development Mode):**
    - Start the application using:
    ```
    npm run start:dev
    ```
2. **Using Docker Compose:**
    - Navigate to the `backend` folder and run:
    ```
    docker-compose up
    ```
    - This command will build Docker images and start both the application and PostgreSQL container.

## Running Tests

1. **Unit Tests:**
    - To run unit tests, use:
    ```
    npm test
    ```
    - This command will execute the unit tests defined in your project using Jest.

2. **End-to-End (e2e) Tests:**
    - To run e2e tests, use:
    ```
    npm run test:e2e
    ```
    - This command will execute the end-to-end tests using Jest with the configuration defined in `test/jest-e2e.json`.

## File Structure
- **backend/**: Contains the NestJS application code.
- **.env.development**: Environment variables for local development and Docker Compose.
- **package.json**: Defines scripts for running the application and tests.

## Repository
- [GitHub Repository](https://github.com/AxayJaviya/nestjs-user-management)
