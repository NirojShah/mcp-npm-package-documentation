import express from "express";
import { McpServer } from "@modelcontextprotocol/server";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/server";
import type { Express, Request, Response } from "express";
import { readFile } from "node:fs/promises";
import { z } from "zod";

const app: Express = express();

app.use(express.json());

const mcpServer = new McpServer({
    name: "npm-package-documentation",
    version: "1.0.0",
});



mcpServer.registerResource(
    "company-guidelines",
    "company://guidelines",
    {
        title: "Company Guidelines",
        description: "Company policies and employee handbook",
        mimeType: "text/plain",
    },
    async () => {
        const content = await readFile("./company-guidelines.txt", "utf-8");

        return {
            contents: [
                {
                    uri: "company://guidelines",
                    mimeType: "text/plain",
                    text: content,
                },
            ],
        };
    }
);


mcpServer.registerTool("user-info", {
    title: "user detail by user id",
    description: "get user detail by user id",
    inputSchema: z.object({
        userId: z.string().describe("The ID of the user to retrieve information for."),
    })
}, async (args) => {
    const userId: string = args.userId;
    return {
        content: [
            {
                type: "text",
                text: "User details"
            }
        ]
    }
}

)

mcpServer.registerPrompt("summary", {
    title: "Summary Prompt",
    description: "A prompt that generates a summary of the provided text.",
    argsSchema: z.object({
        type: z.enum(["user", "document"]),
    })
}, async (args) => {

    const queryFor: "user" | "document" = args.type;
    const instruction =
        queryFor === "user"
            ? "You are a personal assistant. Please summarize the user information."
            : "You are a personal assistant. Please summarize the company documentation.";

    return {
        messages: [
            {
                role: "assistant",
                content: {
                    type: "text",
                    text: instruction
                }
            }
        ]
    };
})


app.post("/mcp", async (req: Request, res: Response) => {
    const body =
        req.method === "GET" || req.method === "HEAD"
            ? undefined
            : JSON.stringify(req.body);

    const request = new Request(
        `http://${req.headers.host}${req.originalUrl}`,
        {
            method: req.method,
            headers: new Headers(req.headers as Record<string, string>),
            body,
        }
    );

    const transport = new WebStandardStreamableHTTPServerTransport();

    await mcpServer.connect(transport);

    const response = await transport.handleRequest(request);

    res.status(response.status);

    response.headers.forEach((value, key) => {
        res.setHeader(key, value);
    });

    res.send(await response.text());
});


app.listen(5000, () => {
    console.log("Listening on http://localhost:5000");
});