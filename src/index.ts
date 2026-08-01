import { McpServer } from "@modelcontextprotocol/server";
import { StdioServerTransport } from "@modelcontextprotocol/server/stdio";
import { z } from "zod";
import ServiceImplementation from "./service/service.implementation.js";


const server = new McpServer({
    name: "npm-package-documentation",
    version: "1.0.0",
    description: "Documentation for the npm package.",
    title: "NPM Package Documentation"
})


server.registerTool(
    "npm-package-documentation",
    {
        title: "NPM Package Documentation",
        description: "Documentation for the npm package.",
        inputSchema: z.object({
            packageName: z.string().describe(
                "The name of the npm package to get documentation for."
            ),
        })
    },
    async (args) => {
        const packageName: string = args.packageName;
        try {
            const service = new ServiceImplementation();
            const packageDetail = await service.getRepoInfo(packageName);

            const documentation = await service.getDocumentation(packageDetail.user, packageDetail.repo);

            if (!documentation || !documentation.CONTENT) {
                return {
                    content: [
                        { type: "text", text: `Documentation not found for package ${packageName}` }
                    ]
                }
            }

            return {
                content: [
                    { type: "text", text: documentation.CONTENT }
                ]
            }
        } catch (err) {
            const error = err as Error;
            return {
                content: [
                    { type: "text", text: `Error: ${error.message}` }
                ]
            }
        }
    }
)

async function _main(): Promise<string> {
    const transport = new StdioServerTransport()
    await server.connect(transport)
    if (server.isConnected()) {
        return "Server is running"
    } else {
        throw new Error("Server failed to connect.");
    }
}

_main().then((message) => {
    console.log(message);
}).catch((err) => {
    console.error(err);
})