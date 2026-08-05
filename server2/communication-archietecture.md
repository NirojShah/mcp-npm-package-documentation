# MCP Communication Architecture: Local (stdio) vs Remote (HTTP)

## Overview

The Model Context Protocol (MCP) supports multiple transport mechanisms for communication between clients and servers. The choice of transport determines whether an MCP server can only be used locally or can be accessed remotely over a network.

This document explains the differences between `StdioServerTransport` and HTTP-based transports, and how they fit into a distributed application architecture.

---

# Local Communication using `StdioServerTransport`

A server created with `StdioServerTransport` communicates through the operating system's standard input (`stdin`) and standard output (`stdout`).

```ts
const transport = new StdioServerTransport();
await server.connect(transport);
```

### Architecture

```text
+--------------------+
|    MCP Client      |
+---------+----------+
          |
      stdin/stdout
          |
+---------v----------+
|    MCP Server      |
+--------------------+
```

### Characteristics

* Runs on the same machine as the client.
* The client starts the MCP server as a child process.
* Communication occurs through the child process's standard input and output.
* No network communication is involved.
* No HTTP server is required.
* No TCP port is opened.

### Suitable For

* Local development
* MCP Inspector
* Claude Desktop
* Local command-line applications

---

# Why `StdioServerTransport` Cannot Be Used Across Machines

Standard input and standard output exist only between a parent process and the child process that it launches.

For example:

```text
Machine A
│
├── Backend
│     │
│     └── launches MCP Server
│
└── stdin/stdout connection
```

If the MCP server is running on another machine:

```text
Machine A ---------------- Machine B
```

there is no stdin/stdout connection available between the two machines.

Therefore, `StdioServerTransport` cannot be used for remote communication.

---

# Remote Communication using HTTP

When the MCP server needs to run on a different machine, it should expose an HTTP-capable transport.

The server listens on an HTTP endpoint, allowing remote MCP clients to communicate over the network.

Conceptually:

```text
+------------------------+
|      Angular UI        |
+-----------+------------+
            |
          HTTP
            |
+-----------v------------+
|    Backend Service     |
|      (MCP Client)      |
+-----------+------------+
            |
        MCP over HTTP
            |
+-----------v------------+
|      MCP Server        |
+------------------------+
```

---

# Responsibilities of Each Component

## Machine A (Angular)

Responsible for:

* Collecting user input
* Sending HTTP requests to the backend
* Displaying responses

Angular does **not** communicate directly with the MCP server.

---

## Machine B (Backend)

Responsible for:

* Receiving requests from Angular
* Maintaining an MCP client connection
* Calling MCP tools
* Returning results to Angular

Example flow:

```text
Angular
    |
POST /documentation
    |
Backend
    |
callTool(...)
    |
MCP Server
```

The backend creates the MCP client once and reuses it for subsequent tool calls.

---

## Machine C (MCP Server)

Responsible for:

* Registering MCP tools
* Executing business logic
* Returning tool responses

The implementation of the tools remains unchanged regardless of the transport.

Example:

```ts
server.registerTool(
    "npm-package-documentation",
    {
        title: "...",
        description: "...",
        inputSchema: ...
    },
    async () => {
        // Business logic
    }
);
```

The transport layer is independent of the tool implementation.

---

# What Changes When Moving from stdio to HTTP?

## No Changes

The following remain exactly the same:

* Tool registration
* Business logic
* Service implementations
* Data models
* Documentation retrieval logic
* Error handling

---

## Changes Required

Only the transport layer changes.

Instead of:

```ts
const transport = new StdioServerTransport();
await server.connect(transport);
```

the server is configured with an HTTP-capable transport and exposed through an HTTP endpoint.

The MCP client then connects to this endpoint instead of spawning the server as a child process.

---

# Communication Flow

## Local (stdio)

```text
Client
   |
stdin/stdout
   |
MCP Server
```

---

## Distributed (HTTP)

```text
Angular
   |
HTTP
   |
Backend
   |
MCP Client
   |
HTTP (MCP)
   |
MCP Server
```

---

# Summary

| Feature                          | Stdio Transport | HTTP Transport                   |
| -------------------------------- | --------------- | -------------------------------- |
| Same machine only                | Yes             | No                               |
| Remote communication             | No              | Yes                              |
| Requires HTTP server             | No              | Yes                              |
| Opens network port               | No              | Yes                              |
| Used by Claude Desktop           | Yes             | Yes (depending on configuration) |
| Suitable for production services | Limited         | Yes                              |

---

# Recommended Approach

Choose the transport based on your deployment scenario:

* Use **`StdioServerTransport`** for local development, desktop integrations, and tools that launch the MCP server as a child process.
* Use an **HTTP-capable transport** when the MCP server must be accessed by applications running on other machines or across a network.

The most important architectural principle is that the **transport changes, but the tools do not**. Your registered tools, service layer, and business logic remain the same regardless of whether the server communicates via stdio or HTTP.
