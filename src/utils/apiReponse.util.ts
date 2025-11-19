export class ApiResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: any;
  error: null;

  constructor(statusCode: number, message: string, data: any) {
    this.success = statusCode < 400;
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
    this.error = null;
  }
}
