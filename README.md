# Argon

Argon is a highly modular, next-generation management and operations platform tailored for modern communities and enterprises. Built with a dynamic, extensibility-first architecture, it enables you to plug in and manage custom modules seamlessly.

## Features

- 🧩 **Dynamic Module System:** Seamlessly load, enable, and manage custom features and integrations via the built-in Module Manager.
- 🎨 **Beautiful UI:** Built with React, TailwindCSS, and Shadcn UI to deliver a premium, modern, and responsive interface.
- ⚡ **High Performance:** Powered by TanStack Start and TanStack React Router on the frontend, alongside a lightweight backend for fast interactions.
- 🛠️ **Extensible SDK:** Create your own modules using the Argon SDK to hook directly into the dashboard and APIs.
- 🔒 **Secure & Scalable:** Designed with security and role-based access control at its core.

## Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed on your machine.

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Lumonol/Argon.git
   cd Argon
   ```
2. Install the dependencies:
   ```bash
   npm install
   ```

### Running the Application

To start the development server (which concurrently runs both the TanStack Start frontend and the backend):
```bash
npm run dev
```

### Database Management
To generate and push database schemas via Drizzle:
```bash
npm run db:generate
npm run db:push
```

## Architecture

Argon utilizes a decoupled architecture where features are bundled into standalone **Modules** (located in the `modules/` directory). Each module can define its own frontend components, backend APIs, and database schemas. The core platform dynamically discovers and loads these modules based on the configuration.

## License
Refer to the `LICENCE` file for more details on usage and distribution rights.
