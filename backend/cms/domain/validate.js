import { ValidationError } from "./errors.js";

export function validate(schema, value, path = "root") {
  const t = schema.type;
  const okType =
    t === "array" ? Array.isArray(value) :
    t === "object" ? value && typeof value === "object" && !Array.isArray(value) :
    typeof value === t;
  if (!okType) throw new ValidationError(path + ": harus bertipe " + t);

  if (t === "string") {
    if (schema.enum && !schema.enum.includes(value)) throw new ValidationError(path + ": nilai tidak diizinkan");
    if (schema.max && value.length > schema.max) throw new ValidationError(path + ": melebihi " + schema.max + " karakter");
  }
  if (t === "array") {
    if (schema.min != null && value.length < schema.min) throw new ValidationError(path + ": minimal " + schema.min + " item");
    if (schema.max != null && value.length > schema.max) throw new ValidationError(path + ": maksimal " + schema.max + " item");
    value.forEach((v, i) => validate(schema.of, v, path + "[" + i + "]"));
  }
  if (t === "object") {
    if (schema.additionalProperties === false) {
      for (const k of Object.keys(value))
        if (!schema.props[k]) throw new ValidationError(path + "." + k + ": field tidak dikenal (ditolak)");
    }
    for (const k of schema.required || [])
      if (!(k in value)) throw new ValidationError(path + "." + k + ": wajib ada");
    for (const [k, sub] of Object.entries(schema.props))
      if (k in value) validate(sub, value[k], path + "." + k);
  }
  return true;
}
