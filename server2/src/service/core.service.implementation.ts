import type Service from "./core.service.js";
import ResponseDto from "../response-dto/response.dto.js";
import STATUS_CODES from "../status-codes/status.code.js";
import { readFile } from "node:fs/promises";

class ServiceImplementation implements Service {
    async companyGudelines(): Promise<ResponseDto> {

        const guidelines = await readFile("../assets/company-guidelines.txt", "utf-8")
        console.log(guidelines)
        if (guidelines.length > 0) {
            return new ResponseDto(STATUS_CODES.OK, "successfully fetched.", guidelines)
        }
        return new ResponseDto(STATUS_CODES.NOT_FOUND, "file not found.", null)
    }

    async userInfo(): Promise<ResponseDto> {
        const file = await readFile("../assets/user.json", "utf-8")
        const userDetails = JSON.parse(file);
        if (userDetails.data.length > 0) {
            return new ResponseDto(STATUS_CODES.NOT_FOUND, "file not found.", null)
        }
        return new ResponseDto(STATUS_CODES.NOT_FOUND, "file not found.", null)
    }

    async userByid(userId: number): Promise<ResponseDto> {
        const file = await readFile("../assets/user.json", "utf-8");
        const userList = JSON.parse(file);
        if (userList.data.length > 0) {
            const user = userList.data.find((usr: any) => usr.id === userId);
            if (user) {
                return new ResponseDto(STATUS_CODES.OK, "successfully fetched", user)
            }
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