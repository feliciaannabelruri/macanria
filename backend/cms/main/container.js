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
   Vercel (ada KV_REST_API_URL) -> KV + Blob (di-import lazy supaya paket @vercel/*
   tidak pernah dimuat di lokal/VPS). Selain itu -> File + Memory + Local storage.
   Swap adapter = satu-satunya perbedaan antar lingkungan. */
const useKv = !!process.env.KV_REST_API_URL;

let contentRepo, rateLimiter, imageStorage;
if (useKv) {
  const { KvContentRepository } = await import("../adapters/persistence/KvContentRepository.js");
  const { KvRateLimiter } = await import("../adapters/security/KvRateLimiter.js");
  const { BlobImageStorage } = await import("../adapters/storage/BlobImageStorage.js");
  contentRepo = new KvContentRepository();
  rateLimiter = new KvRateLimiter({ max: 5, windowSec: 300 });
  imageStorage = new BlobImageStorage();
} else {
  contentRepo = new FileContentRepository();
  rateLimiter = new MemoryRateLimiter({ max: 5, windowSec: 300 });
  imageStorage = new LocalImageStorage();
}

export const session = new JwtSessionManager(process.env.SESSION_SECRET, "8h");

export const useCases = {
  getSection:    makeGetSection({ contentRepo }),
  updateSection: makeUpdateSection({ contentRepo }),
  login:         makeLogin({ passwordHasher, session, rateLimiter, adminPasswordHash: process.env.ADMIN_PASSWORD_HASH }),
  uploadImage:   makeUploadImage({ imageStorage }),
};
