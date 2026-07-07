import { session } from "./container.js";
import { AuthError } from "../domain/errors.js";

const COOKIE = "mcms_session";
const MAX_AGE = 60 * 60 * 8; // 8 jam

// Parse header Cookie -> ambil token sesi. Tanpa dependency eksternal (portabel).
function parseSessionCookie(header) {
  if (!header) return null;
  var parts = header.split(";");
  for (var i = 0; i < parts.length; i++) {
    var idx = parts[i].indexOf("=");
    if (idx < 0) continue;
    var name = parts[i].slice(0, idx).trim();
    if (name === COOKIE) {
      var val = parts[i].slice(idx + 1).trim();
      try { return decodeURIComponent(val); } catch (e) { return val; }
    }
  }
  return null;
}

function serialize(name, value, maxAge) {
  return name + "=" + encodeURIComponent(value) +
    "; Max-Age=" + maxAge +
    "; Path=/; HttpOnly; Secure; SameSite=Lax";
}

export function getToken(req) {
  return parseSessionCookie(req.headers.cookie || "");
}

export function requireLogin(req) {
  const token = getToken(req);
  const payload = token && session.verify(token);
  if (!payload) throw new AuthError();
  return payload;
}

export function sessionCookie(token) {
  return serialize(COOKIE, token, MAX_AGE);
}

export function clearCookie() {
  return serialize(COOKIE, "", 0);
}
