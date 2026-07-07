import { SCHEMAS, isSection } from "../../domain/schema/index.js";
import { validate } from "../../domain/validate.js";
import { NotFoundError } from "../../domain/errors.js";
export const makeUpdateSection = ({ contentRepo }) => async (section, payload) => {
  if (!isSection(section)) throw new NotFoundError("Section tidak dikenal");
  validate(SCHEMAS[section], payload);
  await contentRepo.backup(section);
  await contentRepo.write(section, payload);
  return { ok: true, section, savedAt: new Date().toISOString() };
};
