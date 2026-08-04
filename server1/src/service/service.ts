import type { DocumentationResponse, RepoInfo } from "./data.model.js";


interface Service{
    getRepoInfo(packageName: string): Promise<RepoInfo>;
    getDocumentation(user: string, repo: string ): Promise<DocumentationResponse>;
}

export default Service;
