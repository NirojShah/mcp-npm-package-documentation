import type { DocumentationResponse, RepoInfo } from "./data.model.js";
import FetchService from "./fetch.api.js";
import type Service from "./service.js";

class ServiceImplementation implements Service {

    private fetchApi: FetchService;

    constructor() {
        this.fetchApi = new FetchService();
    }

    async getRepoInfo(packageName: string): Promise<RepoInfo> {
        const url = `https://registry.npmjs.org/${packageName}`;
        const response = await this.fetchApi.fetch(url, "GET", 5000);
        if (!response.ok) {
            throw new Error(`Failed to fetch package info for ${packageName}: ${response.statusText}`);
        }
        const data = await response.json();
        const repository = data.repository;
        if (!repository || !repository.url) {
            throw new Error(`Repository information not found for package ${packageName}`);
        }
        const repoUrl = repository.url.replace(/^git\+/, '').replace(/\.git$/, '');
        const match = repoUrl.match(/github\.com[:/](.+?)\/(.+?)(?:\.git)?$/);
        if (!match) {
            throw new Error(`Invalid GitHub repository URL: ${repoUrl}`);
        }
        return {
            user: match[1],
            repo: match[2]
        };
    }

    async getDocumentation(user: string, repo: string): Promise<DocumentationResponse> {

        const mainUrl: string = "https://raw.githubusercontent.com";
        const possibilities: string[] = [
            `${user}/${repo}/main/README.md`,
            `${user}/${repo}/master/README.md`,
            `${user}/${repo}/main/readme.md`,
            `${user}/${repo}/master/readme.md`,
            `${user}/${repo}/main/Readme.md`,
            `${user}/${repo}/master/Readme.md`
        ];

        const resp = Promise.any(possibilities.map(async (path) => {
            const url = `${mainUrl}/${path}`;
            try {
                const response = await this.fetchApi.fetch(url, "GET", 5000);
                if (response.ok) {
                    const content = await response.text();
                    return { CONTENT: content };
                }
            } catch (error) {
                console.error(`Failed to fetch documentation from ${url}:`, error);
            }
            throw new Error(`Documentation not found at ${url}`);
        })).then((result) => {
            return result;
        }).catch((error) => {
            console.error("All attempts to fetch documentation failed:", error);
        });

        const documentation = await resp.then((result) => {
            if (result) {
                return result;
            } else {
                return "Not found"
            }
        }).catch((error) => {
            console.error("Error while fetching documentation:", error);
            return "Not found";
        });

        return documentation as DocumentationResponse;

    }
}

export default ServiceImplementation;
