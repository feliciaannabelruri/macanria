export class DomainError extends Error {
  constructor(message, status = 400) { super(message); this.name = "DomainError"; this.status = status; }
}
export class NotFoundError extends DomainError { constructor(m = "Tidak ditemukan") { super(m, 404); } }
export class ValidationError extends DomainError { constructor(m) { super(m, 422); } }
export class AuthError extends DomainError { constructor(m = "Tidak terautentikasi") { super(m, 401); } }
export class RateLimitError extends DomainError { constructor(m = "Terlalu banyak percobaan") { super(m, 429); } }
export const toStatus = (e) => (e && e.status) || 500;
