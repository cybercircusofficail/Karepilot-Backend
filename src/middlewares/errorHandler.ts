import { Request, Response, NextFunction } from "express";
import httpStatus from "http-status";
import { Error as MongooseError } from "mongoose";
import { AppError } from "../utils/customErrors";

interface ErrorResponse {
  success: false;
  message: string;
  statusCode: number;
  errors?: any[];
  stack?: string;
}

export const NotFound = (req: Request, res: Response, next: NextFunction) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(httpStatus.NOT_FOUND).json({
    success: false,
    message: error.message,
    statusCode: httpStatus.NOT_FOUND,
    errors: [{ 
      field: "route",
      message: `Route '${req.method} ${req.originalUrl}' does not exist` 
    }],
  });
};

export const errorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = error.statusCode || httpStatus.INTERNAL_SERVER_ERROR;
  let message = error.message || "Internal Server Error";
  let errors: any[] = [];

  if (error instanceof AppError) {
    statusCode = error.statusCode;
    message = error.message;
    if (error.isOperational) {
      errors = [{ message: error.message }];
    }
  }

  else if (error instanceof MongooseError.CastError) {
    statusCode = httpStatus.BAD_REQUEST;
    message = `Invalid ${error.path}: ${error.value}`;
    errors = [{ 
      field: error.path, 
      message: `Invalid value '${error.value}' for field '${error.path}'` 
    }];
  }

  else if (error instanceof MongooseError.ValidationError) {
    statusCode = httpStatus.BAD_REQUEST;
    message = "Validation Failed";
    errors = Object.values(error.errors).map((err: any) => ({
      field: err.path,
      message: err.message,
      value: err.value,
      kind: err.kind,
    }));
  }

  else if (error.name === "MongoError" || error.name === "MongoServerError") {
    if (error.code === 11000) {
      statusCode = httpStatus.CONFLICT;
      const field = error.keyPattern ? Object.keys(error.keyPattern)[0] : undefined;
      const value = (field && error.keyValue) ? error.keyValue[field] : undefined;
      message = field ? `Duplicate value for field: ${field}` : "Duplicate value error";
      errors = [{ 
        field: field ?? null, 
        value,
        message: `${field} '${value}' already exists` 
      }];
    }
  }

  else if (error.name === "JsonWebTokenError") {
    statusCode = httpStatus.UNAUTHORIZED;
    message = "Invalid authentication token";
    errors = [{ message: "Token is invalid or malformed" }];
  }
  
  else if (error.name === "TokenExpiredError") {
    statusCode = httpStatus.UNAUTHORIZED;
    message = "Authentication token has expired";
    errors = [{ message: "Please login again", expiredAt: error.expiredAt }];
  }

  else if (error.name === "NotBeforeError") {
    statusCode = httpStatus.UNAUTHORIZED;
    message = "Token not active yet";
    errors = [{ message: "Token cannot be used before specified time" }];
  }

  else if (error.name === "MulterError") {
    statusCode = httpStatus.BAD_REQUEST;
    
    switch (error.code) {
      case "LIMIT_FILE_SIZE":
        message = "File size too large";
        errors = [{ 
          field: error.field,
          message: `File size exceeds maximum allowed size`,
          limit: error.message 
        }];
        break;
      
      case "LIMIT_FILE_COUNT":
        message = "Too many files uploaded";
        errors = [{ message: `Maximum ${error.message} files allowed` }];
        break;
      
      case "LIMIT_UNEXPECTED_FILE":
        message = "Unexpected field in file upload";
        errors = [{ 
          field: error.field,
          message: `Field '${error.field}' is not allowed` 
        }];
        break;
      
      case "LIMIT_FIELD_KEY":
        message = "Field name too long";
        errors = [{ message: "Field name exceeds maximum length" }];
        break;
      
      case "LIMIT_FIELD_VALUE":
        message = "Field value too long";
        errors = [{ message: "Field value exceeds maximum length" }];
        break;
      
      case "LIMIT_FIELD_COUNT":
        message = "Too many fields";
        errors = [{ message: "Number of fields exceeds maximum allowed" }];
        break;
      
      default:
        message = "File upload error";
        errors = [{ message: error.message }];
    }
  }

  else if (error instanceof SyntaxError && "body" in error) {
    statusCode = httpStatus.BAD_REQUEST;
    message = "Invalid JSON format in request body";
    errors = [{ 
      message: "Request body contains invalid JSON syntax",
      details: error.message 
    }];
  }

  else if (error instanceof TypeError) {
    statusCode = httpStatus.INTERNAL_SERVER_ERROR;
    message = "Type Error occurred";
    errors = [{ message: error.message }];
  }

  else if (error instanceof ReferenceError) {
    statusCode = httpStatus.INTERNAL_SERVER_ERROR;
    message = "Reference Error occurred";
    errors = [{ message: error.message }];
  }

  else if (error instanceof RangeError) {
    statusCode = httpStatus.BAD_REQUEST;
    message = "Value out of range";
    errors = [{ message: error.message }];
  }

  else if (error instanceof URIError) {
    statusCode = httpStatus.BAD_REQUEST;
    message = "Invalid URI";
    errors = [{ message: "Malformed URI component" }];
  }

  else if (error.isAxiosError) {
    statusCode = error.response?.status || httpStatus.BAD_GATEWAY;
    message = "External API request failed";
    errors = [{ 
      message: error.response?.data?.message || error.message,
      url: error.config?.url,
      method: error.config?.method 
    }];
  }

  else if (error.name === "MongoNetworkError" || error.name === "MongooseServerSelectionError") {
    statusCode = httpStatus.SERVICE_UNAVAILABLE;
    message = "Database connection failed";
    errors = [{ 
      message: "Unable to connect to database. Please try again later.",
      details: error.message 
    }];
  }

  else if (error.name === "MongooseTimeoutError") {
    statusCode = httpStatus.REQUEST_TIMEOUT;
    message = "Request timeout";
    errors = [{ message: "Operation took too long to complete" }];
  }

  else if (error.name === "RateLimitError") {
    statusCode = httpStatus.TOO_MANY_REQUESTS;
    message = "Too many requests";
    errors = [{ 
      message: "You have exceeded the rate limit. Please try again later.",
      retryAfter: error.retryAfter 
    }];
  }

  else if (error.name === "PermissionError" || error.name === "ForbiddenError") {
    statusCode = httpStatus.FORBIDDEN;
    message = "Access forbidden";
    errors = [{ 
      message: "You do not have permission to perform this action" 
    }];
  }

  else if (error.array && typeof error.array === "function") {
    statusCode = httpStatus.BAD_REQUEST;
    message = "Validation Failed";
    errors = error.array().map((err: any) => ({
      field: err.param || err.path,
      message: err.msg,
      value: err.value,
      location: err.location,
    }));
  }

  else if (error.type && error.type.includes("Stripe")) {
    statusCode = httpStatus.BAD_REQUEST;
    message = "Payment processing error";
    errors = [{ 
      message: error.message,
      type: error.type,
      code: error.code 
    }];
  }

  else if (error.http_code && error.name === "CloudinaryError") {
    statusCode = error.http_code;
    message = "File upload to cloud storage failed";
    errors = [{ 
      message: error.message,
      code: error.error?.code 
    }];
  }

  else {
    statusCode = httpStatus.INTERNAL_SERVER_ERROR;
    message = "An unexpected error occurred";
    errors = [{ message: error.message || "Unknown error" }];
  }

  if (process.env.NODE_ENV === "development") {
    console.error("❌ Error:", {
      name: error.name,
      message: error.message,
      statusCode,
      stack: error.stack,
    });
  }

  const errorResponse: ErrorResponse = {
    success: false,
    message,
    statusCode,
    errors: errors.length > 0 ? errors : [{ message }],
  };

  if (process.env.NODE_ENV === "development" && error.stack) {
    errorResponse.stack = error.stack;
  }

  res.status(statusCode).json(errorResponse);
};

export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export const handleUnhandledRejection = () => {
  process.on("unhandledRejection", (reason: any, promise: Promise<any>) => {
    console.error("🔥 UNHANDLED REJECTION! Shutting down gracefully...");
    console.error("Reason:", reason);
    console.error("Promise:", promise);
    process.exit(1);
  });
};

export const handleUncaughtException = () => {
  process.on("uncaughtException", (error: Error) => {
    console.error("🔥 UNCAUGHT EXCEPTION! Shutting down gracefully...");
    console.error("Error:", error.name, error.message);
    console.error("Stack:", error.stack);
    process.exit(1);
  });
};

