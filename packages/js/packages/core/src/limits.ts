export interface ParserLimits {
  maxVaultBytes: number;
  maxPayloadBytes: number;
  maxJsonNesting: number;
  maxKeyCount: number;
  maxKeyBytes: number;
  maxExtensionBytes: number;
  maxUnlockSlots: number;
  maxTombstones: number;
  maxExtensions: number;
  maxArgon2MemoryKiB: number;
  maxArgon2Time: number;
  maxArgon2Parallelism: number;
  minArgon2MemoryKiB: number;
  minArgon2Time: number;
  minArgon2Parallelism: number;
  maxIdentityBytes: number;
}

/** SPEC Appendix C defaults. Applications MAY tighten; they MUST NOT silently raise KDF mins. */
export const DEFAULT_LIMITS: ParserLimits = {
  maxVaultBytes: 16 * 1024 * 1024,
  maxPayloadBytes: 16 * 1024 * 1024,
  maxJsonNesting: 32,
  maxKeyCount: 1024,
  maxKeyBytes: 1024 * 1024,
  maxExtensionBytes: 64 * 1024,
  maxUnlockSlots: 64,
  maxTombstones: 1024,
  maxExtensions: 64,
  maxArgon2MemoryKiB: 1_048_576,
  maxArgon2Time: 16,
  maxArgon2Parallelism: 16,
  minArgon2MemoryKiB: 16_384,
  minArgon2Time: 2,
  minArgon2Parallelism: 1,
  maxIdentityBytes: 2048,
};

export const RECOMMENDED_ARGON2ID = {
  alg: "Argon2id" as const,
  m: 65_536,
  t: 3,
  p: 4,
  key_length: 32,
};

/** Legal for tests/CI; still meets SPEC §6.5 minima. */
export const TEST_ARGON2ID = {
  alg: "Argon2id" as const,
  m: 16_384,
  t: 2,
  p: 1,
  key_length: 32,
};
