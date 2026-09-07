export class DomainError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly httpStatus: number,
  ) {
    super(message);
    this.name = new.target.name;
  }
}

export class NotFoundError extends DomainError {
  constructor(message = "Recurso no encontrado.") {
    super(message, "NOT_FOUND", 404);
  }
}

export class ValidationError extends DomainError {
  constructor(message = "Datos inválidos.") {
    super(message, "VALIDATION_ERROR", 400);
  }
}

export class UnauthorizedError extends DomainError {
  constructor(message = "No autorizado.") {
    super(message, "UNAUTHORIZED", 401);
  }
}

export class ConflictError extends DomainError {
  constructor(message = "El recurso ya existe.") {
    super(message, "CONFLICT", 409);
  }
}
