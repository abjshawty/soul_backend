# Server Template

A production-ready backend server template built with Fastify, Prisma, and TypeScript. This template provides a solid foundation for building scalable and maintainable API services with built-in support for Kafka messaging.

## Features

- **Fastify** - High performance web framework
- **Prisma** - Type-safe database client
- **TypeScript** - Type-safe JavaScript
- **Kafka Integration** - Built-in support for event streaming
- **JWT Authentication** - Secure API endpoints
- **File Uploads** - Handle multipart file uploads
- **Data Export** - Export data to Excel and PDF
- **Docker Support** - Containerized deployment
- **Testing** - Jest test framework

## Prerequisites

- Node.js 18+
- Docker & Docker Compose (for containerized deployment)
- PostgreSQL (or your preferred database)
- Kafka (optional, for event streaming)

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/abjshawty/server.git
cd server
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Copy the example environment file and update the values:

```bash
cp .env.example .env
```

Edit the `.env` file with your configuration:

```env
# Server
PORT=3000
NODE_ENV=development

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/dbname?schema=public"

# JWT
JWT_SECRET=your-jwt-secret
JWT_EXPIRES_IN=1d

# Kafka (optional)
KAFKA_BROKERS=localhost:9092
```

### 4. Database Setup

Run database migrations:

```bash
# Generate and run migrations
npx prisma migrate dev --name init

# Generate Prisma Client
npx prisma generate
```

## Development

### Start development server

```bash
npm run dev
```

The server will be available at `http://localhost:3000`

### Build for production

```bash
# Build TypeScript
tsc

# Start production server
npm start
```

## Testing

Run tests in watch mode:

```bash
npm test
```

## Docker

Build and run the application using Docker:

```bash
# Build the Docker image
docker build -t server-template .

# Run the container
docker run -p 3000:3000 --env-file .env server-template
```

## Project Structure

```
server/
├── src/
│   ├── index.ts          # Application entry point
│   └── helpers/          # Helper functions and utilities
│   └── routes/           # Routes
│   └── models/           # Models
│   └── controllers/      # Controllers
│   └── middlewares/      # Middlewares
│   └── utils/            # Utilities
│   └── locales/          # Locales
├── prisma/
│   └── schema.prisma   # Database schema
├── tests/                # Test files
├── .env                  # Environment variables
├── .gitignore
├── package.json
└── tsconfig.json
```

## Available Scripts

- `npm run build` - Build TypeScript
- `npm run dev` - Start development server with hot-reload
- `npm start` - Start production server
- `npm test` - Run tests
- `npm run migrate` - Run database migrations
- `npm run format` - Format code with Prettier
- `npm run gen` - Generate Prisma client
- `npm run reset` - Reset database and run migrations

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
