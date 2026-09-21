import { jcs } from "./jcs.js";
import type { VaultContainer, UnlockSlot } from "./types.js";

export function aadObject(container: Pick<
  VaultContainer,
  | "critical_extensions"
  | "crypto"
  | "extensions"
  | "format"
  | "generation"
  | "previous_generation_hash"
  | "unlock_slots"
  | "vault_id"
  | "version"
>): Record<string, unknown> {
  return {
    critical_extensions: container.critical_extensions,
    crypto: { aead: container.crypto.aead, iv: container.crypto.iv },
    extensions: container.extensions,
    format: container.format,
    generation: container.generation,
    previous_generation_hash: container.previous_generation_hash,
    unlock_slots: container.unlock_slots,
    vault_id: container.vault_id,
    version: container.version,
  };
}

export function vaultAad(container: Parameters<typeof aadObject>[0]): Uint8Array {
  return new TextEncoder().encode(jcs(aadObject(container)));
}

export function wrapAad(method: string, slotId: string, vaultId: string): Uint8Array {
  return new TextEncoder().encode(
    jcs({
      method,
      slot_id: slotId,
      vault_id: vaultId,
    }),
  );
}

export function containerWithoutGenerationHash(container: VaultContainer): Record<string, unknown> {
  const { generation_hash: _, ...rest } = container;
  return rest;
}

export function slotFingerprint(slot: UnlockSlot): string {
  return jcs(slot);
}
