import { isSection } from "../../domain/schema/index.js";
import { NotFoundError } from "../../domain/errors.js";
export const makeGetSection = ({ contentRepo }) => async (section) => {
  if (!isSection(section)) throw new NotFoundError("Section tidak dikenal");
  return contentRepo.read(section);
};
