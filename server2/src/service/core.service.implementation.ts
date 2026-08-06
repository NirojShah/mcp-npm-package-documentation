import type Service from "./core.service.js";
import ResponseDto from "../response-dto/response.dto.js";
import STATUS_CODES from "../status-codes/status.code.js";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ServiceImplementation implements Service {

    async companyGudelines(): Promise<ResponseDto> {

        const filePath = path.join(__dirname, "../assets/company-guidelines.txt")
        const guidelines = await readFile(filePath, "utf-8")
        if (guidelines.length > 0) {
            return new ResponseDto(STATUS_CODES.OK, "successfully fetched.", guidelines)
        }
        return new ResponseDto(STATUS_CODES.NOT_FOUND, "file not found.", null)
    }

    async userInfo(page: number, limit: number): Promise<ResponseDto> {
        const filePath = path.join(__dirname, "../assets/user.json");
        const file = await readFile(filePath, "utf-8");
        const userDetails = JSON.parse(file);

        if (!userDetails?.data || userDetails.data.length === 0) {
            return new ResponseDto(
                STATUS_CODES.NOT_FOUND,
                "No users found.",
                null
            );
        }

        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;

        const paginatedUsers = userDetails.data.slice(startIndex, endIndex);

        return new ResponseDto(
            STATUS_CODES.OK,
            "All users.",
            {
                page,
                limit,
                totalRecords: userDetails.data.length,
                totalPages: Math.ceil(userDetails.data.length / limit),
                data: paginatedUsers
            }
        );
    }

    async userByid(userId: number): Promise<ResponseDto> {
        const filePath = path.join(__dirname, "../assets/user.json")
        const file = await readFile(filePath, "utf-8");
        const userList = JSON.parse(file);
        if (userList.length > 0) {
            const user = userList.find((usr: any) => usr.id === userId);
            if (user) {
                return new ResponseDto(STATUS_CODES.OK, "successfully fetched", JSON.stringify(user))
            }
            return new ResponseDto(STATUS_CODES.NOT_FOUND, "User Not found.", null)
        }
        return new ResponseDto(STATUS_CODES.NOT_FOUND, "file not found.", null)

    }

    async summaryPrompt(queryType: "user" | "document"): Promise<ResponseDto> {
        const instruction =
            queryType === "user"
                ? "You are a personal assistant. Please summarize the user information."
                : "You are a personal assistant. Please summarize the company documentation.";

        return new ResponseDto(STATUS_CODES.OK, "successfully fetched the prompt.", { prompt: instruction })
    }

}

export default ServiceImplementation;