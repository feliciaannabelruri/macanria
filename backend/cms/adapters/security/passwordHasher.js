import bcrypt from "bcryptjs";
export const passwordHasher = {
  compare: (plain, hash) => bcrypt.compare(plain, hash),
};
