import { ValidationError } from "../../domain/errors.js";
const ALLOWED = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };
const MAX_BYTES = 4 * 1024 * 1024;
export const makeUploadImage = ({ imageStorage }) => async ({ buffer, mimeType, filename }) => {
  const type = (mimeType || "").split(";")[0].trim();
  if (!ALLOWED[type]) throw new ValidationError("Tipe file tidak diizinkan (hanya jpg/png/webp)");
  if (!buffer || buffer.length === 0) throw new ValidationError("File kosong");
  if (buffer.length > MAX_BYTES) throw new ValidationError("File melebihi 4 MB");
  const url = await imageStorage.save({ buffer, mimeType: type, filename: filename || ("img." + ALLOWED[type]) });
  return { ok: true, url };
};
