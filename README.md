
# Multi-User Messaging System

A multi-user messaging system using the following technologies:

- **Frontend**: React (Vite) with Tailwind CSS
- **Backend**: Node.js with Express
- **Database**: PostgreSQL with Drizzle ORM
- **Real-time Communication**: Socket.IO

## Features

1. Real-time messaging between users
2. Online/offline status for users
3. “Typing…” indicator while chatting
4. Read/unread message sorting system
5. Image and video upload feature
6. Infinite scrolling of messages to the top

## Prerequisites

- Node.js (v14 or later)
- PostgreSQL (v12 or later)
- npm 
- Git

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/sem22-dev/hiryChat.git
```

### 2. Setup the Backend

```bash
cd backend
npm install
cd src
```

- Configure the environment variables:

- Create a .env file in the backend directory.
- Add the following variables:
```bash
    DATABASE_URL=your_postgres_connection_string
    JWT_SECRET=your_jwt_secret_key
    GMAIL_USER=
    GMAIL_APP_PASSWORD=
```
- Run database migrations:
```bash
    npx drizzle-kit generate 
    npx drizzle-kit migrate
    npx drizzle-kit push
```

### 3. Setup the Frontend

```bash
    cd frontend
    npm install
```

- Start the frontend:
```bash
   npm run dev
```



