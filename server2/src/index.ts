import express from "express";
import { McpServer } from "@modelcontextprotocol/server";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/server";
import type { Express, Request, Response } from "express";
import { z } from "zod";
import ServiceImplementation from "./service/core.service.implementation.js";
import STATUS_CODES from "./status-codes/status.code.js";

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
        try {

            const service = new ServiceImplementation();
            const response = await service.companyGudelines();

            if (response.getStatusCode() !== STATUS_CODES.OK) {
                throw new Error(response.getMessage());
            }

            return {
                contents: [
                    {
                        uri: "company://guidelines",
                        mimeType: "text/plain",
                        text: response.getData() as string,
                    },
                ],
            };
        } catch (err) {
            const error = err as Error
            return {
                contents: [
                    {
                        uri: "company://guidelines",
                        mimeType: "text/plain",
                        text: error.message as string
                    }
                ]
            }
        }
    }
);


mcpServer.registerTool("user-info", {
    title: "user detail by user id",
    description: "get user detail by user id",
    inputSchema: z.object({
        userId: z.string().describe("The ID of the user to retrieve information for."),
    })
}, async (args) => {
    const service = new ServiceImplementation();
    const userId: string = args.userId;

    const resp = await service.userByid(Number(userId))
    if (resp.getStatusCode() == STATUS_CODES.OK) {
        return {
            content: [
                {
                    type: "text",
                    text: "User details"
                }
            ]
        }
    }
    return {
        content: [
            {
                type: "text",
                text: resp.getMessage() as string
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
    try {

        const service = new ServiceImplementation()
        const queryFor: "user" | "document" = args.type;
        const resp = await service.summaryPrompt(queryFor);

        if (resp.getStatusCode() == STATUS_CODES.OK) {
            return {
                messages: [
                    {
                        role: "assistant",
                        content: {
                            type: "text",
                            text: resp.getData() as string
                        }
                    }
                ]
            }
        }
        throw new Error(resp.getMessage())
    } catch (err) {
        const error = err as Error;
        return {
            messages: [
                {
                    role: "assistant",
                    content: {
                        type: "text",
                        text: error.message as string
                    }
                }
            ]
        }
    }
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