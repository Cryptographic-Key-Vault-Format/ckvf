export const CKVF_FORMAT = "CKVF";
export const CKVF_CONTAINER_VERSION = "1.0";
export const CKVF_PROTOCOL = "CKVF";
export const CKVF_PROTOCOL_VERSION = "1.0";
export const SPEC_LABEL = "draft-0.1";

export type IdentityType = "email" | "dns";
export type KeyFamily = "openpgp" | "smime";
export type KeyEncoding = "openpgp-tsk" | "pkcs8" | "pkcs12";
export type KeyStatus = "active" | "retired" | "revoked" | "compromised";
export type KeyPurpose = "sign" | "encrypt" | "auth";
export type UnlockMethod = "password-argon2id" | "device-wrap-a256gcm";
export type AeadAlgorithm = "A256GCM";
export type MskAlgorithm = "Ed25519";
export type TombstoneReason = "user-requested" | "compromised-purge" | "policy";

export type OperationName =
  | "ADD_KEY"
  | "RETIRE_KEY"
  | "REVOKE_KEY"
  | "SET_PREFERRED_KEY"
  | "ADD_DEVICE"
  | "REMOVE_DEVICE"
  | "COMMIT_VAULT_GENERATION"
  | "MERGE_VAULT"
  | "UPDATE_METADATA"
  | "DELETE_PRIVATE_KEY"
  | "ESTABLISH_MSK"
  | "REPLACE_MSK";

export interface Extension {
  id: string;
  critical: boolean;
  data: unknown;
}

export interface CryptoParams {
  aead: AeadAlgorithm;
  iv: string;
}

export interface KdfParams {
  alg: "Argon2id";
  salt: string;
  m: number;
  t: number;
  p: number;
  key_length: number;
}

export interface WrapParams {
  alg: AeadAlgorithm;
  iv: string;
  ciphertext: string;
  tag: string;
}

export interface UnlockSlot {
  slot_id: string;
  method: UnlockMethod;
  created_at: string;
  kdf?: KdfParams;
  wrap: WrapParams;
}

export interface VaultContainer {
  format: typeof CKVF_FORMAT;
  version: string;
  vault_id: string;
  generation: number;
  previous_generation_hash: string | null;
  generation_hash: string;
  crypto: CryptoParams;
  unlock_slots: UnlockSlot[];
  ciphertext: string;
  tag: string;
  extensions: Extension[];
  critical_extensions: Extension[];
}

export interface Identity {
  type: IdentityType;
  value: string;
  identity_id: string;
}

export interface MskCurrent {
  msk_id: string;
  algorithm: MskAlgorithm;
  public_key: string;
  private_key: string;
  activated_at: string;
}

export interface MskHistoryEntry {
  msk_id: string;
  algorithm: MskAlgorithm;
  public_key: string;
  activated_at: string;
  retired_at: string;
}

export interface MskState {
  current: MskCurrent;
  history: MskHistoryEntry[];
}

export interface KeyRecord {
  absolute_key_id: string;
  short_key_id: string;
  family: KeyFamily;
  algorithm: string;
  algorithm_suite: string | null;
  encoding: KeyEncoding;
  purpose: KeyPurpose[];
  public_key: string;
  private_key: string | null;
  created_at: string;
  status: KeyStatus;
  metadata: Record<string, never>;
}

export type PreferredKeys = {
  [family in KeyFamily]?: {
    [purpose in KeyPurpose]?: string;
  };
};

export interface VaultMetadata {
  created_at: string;
  updated_at: string;
}

export interface Tombstone {
  absolute_key_id: string;
  deleted_at: string;
  nonce: string;
  reason: TombstoneReason;
}

export interface VaultPayload {
  identity: Identity;
  msk: MskState;
  keys: KeyRecord[];
  preferred_keys: PreferredKeys;
  metadata: VaultMetadata;
  tombstones: Tombstone[];
  extensions: Extension[];
  critical_extensions: Extension[];
}

export interface SignedBody {
  protocol: typeof CKVF_PROTOCOL;
  protocol_version: string;
  operation: OperationName;
  identity_id: string;
  vault_id: string;
  generation: number;
  nonce: string;
  timestamp: string;
  payload_hash: string;
}

export interface OperationSignature {
  algorithm: MskAlgorithm;
  msk_id: string;
  value: string;
}

export interface SignedOperation {
  body: SignedBody;
  payload: Record<string, unknown>;
  signature: OperationSignature;
}

export interface UnlockedVault {
  container: VaultContainer;
  payload: VaultPayload;
  vek: Uint8Array;
}

export interface MergeConflict {
  code: string;
  message: string;
}

export interface MergeResult {
  payload: VaultPayload;
  slots: UnlockSlot[];
  conflicts: MergeConflict[];
}

export interface Compatibility {
  readVersions: string[];
  writeVersions: string[];
  algorithms: string[];
  keyEncodings: KeyEncoding[];
  unlockMethods: UnlockMethod[];
}
