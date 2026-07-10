import { FileContentRepository } from "../adapters/persistence/FileContentRepository.js";
import { LocalImageStorage } from "../adapters/storage/LocalImageStorage.js";
import { JwtSessionManager } from "../adapters/security/JwtSessionManager.js";
import { MemoryRateLimiter } from "../adapters/security/MemoryRateLimiter.js";
import { passwordHasher } from "../adapters/security/passwordHasher.js";
import { makeGetSection } from "../application/usecases/getSection.js";
import { makeUpdateSection } from "../application/usecases/updateSection.js";
import { makeLogin } from "../application/usecases/login.js";
import { makeUploadImage } from "../application/usecases/uploadImage.js";

/* Pemilihan adapter berdasarkan lingkungan.
   Supabase (ada SUPABASE_URL) -> Supabase + Memory.
   Vercel (ada KV_REST_API_URL) -> KV + Blob. Selain itu -> File + Memory.
   Storage gambar: ImageKit bila IMAGEKIT_PRIVATE_KEY ada; jika tidak, ikut lingkungan. */
const useSupabase = !!process.env.SUPABASE_URL;
const useKv = !!process.env.KV_REST_API_URL;
const useImageKit = !!process.env.IMAGEKIT_PRIVATE_KEY;

let contentRepo, rateLimiter, imageStorage;

if (useSupabase) {
  const { SupabaseContentRepository } = await import("../adapters/persistence/SupabaseContentRepository.js");
  contentRepo = new SupabaseContentRepository();
  rateLimiter = new MemoryRateLimiter({ max: 5, windowSec: 300 });
} else if (useKv) {
  const { KvContentRepository } = await import("../adapters/persistence/KvContentRepository.js");
  const { KvRateLimiter } = await import("../adapters/security/KvRateLimiter.js");
  contentRepo = new KvContentRepository();
  rateLimiter = new KvRateLimiter({ max: 5, windowSec: 300 });
} else {
  contentRepo = new FileContentRepository();
  rateLimiter = new MemoryRateLimiter({ max: 5, windowSec: 300 });
}

if (useImageKit) {
  const { ImageKitImageStorage } = await import("../adapters/storage/ImageKitImageStorage.js");
  imageStorage = new ImageKitImageStorage();
} else if (useKv) {
  const { BlobImageStorage } = await import("../adapters/storage/BlobImageStorage.js");
  imageStorage = new BlobImageStorage();
} else {
  imageStorage = new LocalImageStorage();
}

export const session = new JwtSessionManager(process.env.SESSION_SECRET, "8h");

export const useCases = {
  getSection:    makeGetSection({ contentRepo }),
  updateSection: makeUpdateSection({ contentRepo }),
  login:         makeLogin({ passwordHasher, session, rateLimiter, adminPasswordHash: process.env.ADMIN_PASSWORD_HASH }),
  uploadImage:   makeUploadImage({ imageStorage }),
};
