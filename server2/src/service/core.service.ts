import type ResponseDto from "../response-dto/response.dto.js";

interface Service {
    companyGudelines(): Promise<ResponseDto>;
    userInfo(): Promise<ResponseDto>;
    summaryPrompt(queryType: "user" | "document"): Promise<ResponseDto>;
    userByid(userId: number): Promise<ResponseDto>;
}

export default Service;