# MCP Node Documentation

A **Model Context Protocol (MCP)** server that retrieves documentation for any npm package by automatically discovering its GitHub repository and returning its `README.md`.

The server is built using the official **@modelcontextprotocol/server** SDK and communicates over **STDIO**, making it compatible with MCP clients such as Claude Desktop, the MCP Inspector, and other MCP-compatible applications.

---

# Features

* Fetches package information directly from the npm registry.
* Automatically detects the GitHub repository associated with an npm package.
* Downloads the project's README from GitHub.
* Supports repositories using either:

  * `main`
  * `master`
* Supports common README filename variations:

  * `README.md`
  * `Readme.md`
  * `readme.md`
* Uses request timeouts to avoid hanging requests.
* Implements clean separation between:

  * MCP Server
  * Service Layer
  * HTTP Layer
* Fully written in TypeScript.
* Compatible with MCP 2.x.

---

# How It Works

```
          User / MCP Client
                  │
                  ▼
        MCP Tool Invocation
                  │
                  ▼
        npm-package-documentation
                  │
                  ▼
       Fetch npm Registry Metadata
                  │
                  ▼
      Extract GitHub Repository URL
                  │
                  ▼
        Download README.md
                  │
                  ▼
        Return README as Response
```

---

# Project Structure

```
mcp-node-documentation
│
├── src
│   ├── index.ts
│   │
│   └── service
│       ├── data.model.ts
│       ├── fetch.api.ts
│       ├── service.ts
│       └── service.implementation.ts
│
├── package.json
├── tsconfig.json
├── .gitignore
└── README.md
```

---

# Folder Explanation

## src/index.ts

Entry point of the application.

Responsibilities:

* Creates the MCP Server.
* Registers the tool.
* Connects using `StdioServerTransport`.
* Handles tool requests.
* Returns documentation to the MCP client.

Registered Tool:

```
npm-package-documentation
```

Input:

```json
{
    "packageName": "express"
}
```

Output:

```
Contents of README.md
```

---

## src/service/service.ts

Defines the service interface.

```ts
interface Service {
    getRepoInfo(packageName: string): Promise<RepoInfo>;
    getDocumentation(user: string, repo: string): Promise<DocumentationResponse>;
}
```

This abstraction allows multiple implementations in the future.

---

## src/service/service.implementation.ts

Contains all business logic.

Responsibilities:

### 1. Fetch npm package metadata

Example:

```
https://registry.npmjs.org/express
```

Extracts

```json
{
    "repository": {
        "url": "git+https://github.com/expressjs/express.git"
    }
}
```

Converts it into

```
user = expressjs
repo = express
```

---

### 2. Fetch GitHub README

It searches multiple possible locations.

Examples:

```
main/README.md
master/README.md
main/readme.md
master/readme.md
main/Readme.md
master/Readme.md
```

The first successful request is returned using

```ts
Promise.any(...)
```

---

## src/service/fetch.api.ts

Wrapper around the native `fetch()` API.

Features:

* Timeout support
* AbortController
* Error handling
* Automatic cleanup

Instead of repeatedly writing

```ts
fetch(...)
```

the project uses

```ts
fetchApi.fetch(...)
```

which provides consistent behavior.

---

## src/service/data.model.ts

Contains project models.

```ts
export interface RepoInfo {
    user: string;
    repo: string;
}
```

and

```ts
export type DocumentationResponse = {
    CONTENT: string;
}
```

---

# Tool Definition

Tool Name

```
npm-package-documentation
```

Input Schema

```json
{
    "packageName": "string"
}
```

Example

```json
{
    "packageName": "react"
}
```

Response

```
Entire README.md content
```

---

# Request Flow

```
User

↓

MCP Tool

↓

getRepoInfo()

↓

npm Registry API

↓

GitHub Repository

↓

getDocumentation()

↓

raw.githubusercontent.com

↓

README.md

↓

MCP Response
```

---

# Installation

Clone the repository.

```bash
git clone https://github.com/<your-username>/mcp-node-documentation.git
```

Move into the project.

```bash
cd mcp-node-documentation
```

Install dependencies.

```bash
npm install
```

---

# Build

```bash
npm run build
```

Compiled JavaScript will be generated inside

```
dist/
```

---

# Development

Run in watch mode.

```bash
npm run dev
```

---

# Production

```bash
npm start
```

---

# Run MCP Inspector

```bash
npm run local
```

This launches the official MCP Inspector.

You can invoke the tool directly from the Inspector UI.

---

# Example Tool Call

Input

```json
{
    "packageName": "express"
}
```

Processing

```
↓

Fetch npm registry

↓

Extract repository

↓

Fetch README

↓

Return documentation
```

Output

```
# Express

Fast, unopinionated, minimalist web framework...
```

---

# APIs Used

## npm Registry

```
https://registry.npmjs.org/<package-name>
```

Example

```
https://registry.npmjs.org/react
```

Used for discovering the GitHub repository.

---

## GitHub Raw Content

```
https://raw.githubusercontent.com/<user>/<repo>/<branch>/README.md
```

Example

```
https://raw.githubusercontent.com/facebook/react/main/README.md
```

Used for retrieving documentation.

---

# Error Handling

The project gracefully handles:

* Invalid package names
* Missing repositories
* Non-GitHub repositories
* Missing README files
* Network failures
* Timeout errors
* Invalid GitHub URLs

Errors are returned as plain text responses to the MCP client.

---

# Dependencies

## Runtime

| Package                      | Purpose                   |
| ---------------------------- | ------------------------- |
| @modelcontextprotocol/server | MCP server implementation |
| zod                          | Input validation          |

---

## Development

| Package     | Purpose                     |
| ----------- | --------------------------- |
| typescript  | TypeScript compiler         |
| tsx         | Execute TypeScript directly |
| @types/node | Node.js type definitions    |

---

# Design Decisions

The project follows a layered architecture.

```
MCP Server

↓

Service Layer

↓

HTTP Layer

↓

External APIs
```

Benefits:

* Easy to maintain
* Easy to test
* Easy to extend
* Separation of concerns
* Reusable HTTP logic

---

# Future Improvements

Potential enhancements include:

* Support GitLab repositories.
* Support Bitbucket repositories.
* Cache README responses.
* Add configurable request timeouts.
* Return additional package metadata (version, description, homepage, author).
* Support documentation files other than README (e.g., `docs/`, `CONTRIBUTING.md`, `CHANGELOG.md`).
* Support branch detection via the GitHub API instead of assuming `main` or `master`.
* Add unit and integration tests.
* Add logging with configurable log levels.
* Publish the MCP server as an npm package.
* Containerize with Docker.
* Add CI/CD workflows using GitHub Actions.

---

# Requirements

* Node.js 20+
* npm
* TypeScript

---

# License

This project is licensed under the ISC License.

---

# Author

Developed as a simple MCP server that demonstrates how to integrate the npm Registry API with GitHub's raw content service to provide package documentation on demand.
