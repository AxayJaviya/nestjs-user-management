# nestjs-user-management
RESTful APIs for managing user registration, authentication, and profile management using Node.js and NestJS.

## Prerequisites
- **Node.js**: Ensure you have Node.js installed. You can download it from [nodejs.org](https://nodejs.org/).
- **PostgreSQL**: You need PostgreSQL to be set up. You can either:
    - **Run PostgreSQL Locally**: Install PostgreSQL from [the official site](https://www.postgresql.org/download/) and set it up according to your operating system.
    - **Use Docker Compose**: If you prefer, Docker Compose can set up PostgreSQL for you (instructions are provided in the [Running the Application](#running-the-application) section).

## Installation
1. **Clone the repository:**
    ```bash
    git clone https://github.com/AxayJaviya/nestjs-user-management.git
    cd nestjs-user-management/backend
    ```
2. **Install dependencies:**
    ```bash
    npm install
    ```

## Configuration

### Environment Variables

1. **Copy Example Environment File:**
    - The application includes an example environment file. Copy this file to create your `.env` file:
    ```bash
    cp .env.example .env
    ```

2. **Modify the `.env` File:**
    - Edit the `.env` file to configure your environment variables for PostgreSQL. Ensure the `DATABASE_URL` is correctly set whether you are running PostgreSQL locally or via Docker Compose.

## Running the Application

1. **Using Docker Compose (Recommended):**
    - **Build Docker Images:**
        - Navigate to the `backend` folder and build the Docker images using:
      ```bash
      docker-compose build
      ```

    - **Start PostgreSQL Container:**
        - Start the PostgreSQL container and other services defined in your `docker-compose.yml` file:
      ```bash
      docker-compose up -d
      ```
        - This command will run the PostgreSQL container in detached mode (in the background). If you need to view logs or interact with the containers, omit the `-d` flag.

    - **Deploy Prisma Migrations:**
        - Apply Prisma migrations to set up the database schema. This step ensures that your database is in sync with your Prisma schema definitions:
      ```bash
      npm run prisma:deploy
      ```
        - This command will run the Prisma migration scripts that create and update the database schema. It is essential for initializing the database structure and applying any schema changes.

    - **Start the Application:**
        - Start the application by running:
      ```bash
      npm run start:dev
      ```

2. **Running Locally (Without Docker Compose):**
    - Ensure PostgreSQL is running locally.
    - Deploy Prisma migrations:
    ```bash
    npm run prisma:deploy
    ```
    - Start the application:
    ```bash
    npm run start:dev
    ```

## Running Tests

1. **Unit Tests:**
    - To run unit tests, use:
    ```bash
    npm test
    ```
    - This command will execute the unit tests defined in your project using Jest.

2. **End-to-End (e2e) Tests:**
    - To run e2e tests, use:
    ```bash
    npm run test:e2e
    ```
    - This command will execute the end-to-end tests using Jest with the configuration defined in `test/jest-e2e.json`.

## Author
- **Author**: [Axay Javiya](https://linkedin.com/in/axayjaviya)

## References
- **NestJS Documentation**: [https://docs.nestjs.com](https://docs.nestjs.com)
- **PostgreSQL**: [https://www.postgresql.org](https://www.postgresql.org)
- **Prisma**: [https://www.prisma.io](https://www.prisma.io)
