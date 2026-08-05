class ResponseDto {
    private _statusCode: number;
    private _message: string
    private _data: any;

    constructor(statusCode: number, message: string, data?: any) {
        this._statusCode = statusCode;
        this._message = message;
        this._data = data;
    }

    getStatusCode(): number {
        return this._statusCode
    }

    getMessage(): string {
        return this._message
    }

    getData(): any {
        return this._data
    }
}

export default ResponseDto;