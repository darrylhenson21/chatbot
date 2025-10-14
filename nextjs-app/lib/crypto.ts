import { webcrypto } from 'crypto'

const crypto = webcrypto as any

// AES-GCM encryption for API keys
export async function encryptKey(plaintext: string): Promise<string> {
  const secret = process.env.SESSION_SECRET || 'change-this-secret'
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret.padEnd(32, '0').slice(0, 32)),
    'AES-GCM',
    false,
    ['encrypt', 'decrypt']
  )

  const iv = crypto.getRandomValues(new Uint8Array(12))
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    keyMaterial,
    new TextEncoder().encode(plaintext)
  )

  // Combine iv and encrypted data
  const combined = new Uint8Array(iv.length + encrypted.byteLength)
  combined.set(iv, 0)
  combined.set(new Uint8Array(encrypted), iv.length)

  return Buffer.from(combined).toString('base64')
}

export async function decryptKey(encrypted: string): Promise<string> {
  const secret = process.env.SESSION_SECRET || 'change-this-secret'
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret.padEnd(32, '0').slice(0, 32)),
    'AES-GCM',
    false,
    ['encrypt', 'decrypt']
  )

  const combined = Buffer.from(encrypted, 'base64')
  const iv = combined.slice(0, 12)
  const data = combined.slice(12)

  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    keyMaterial,
    data
  )

  return new TextDecoder().decode(decrypted)
}
