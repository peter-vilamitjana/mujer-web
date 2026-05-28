/**
 * Asigna el rol superadmin al usuario con el UID indicado.
 * Uso: SUPERADMIN_UID=xxx npx tsx scripts/set-superadmin.ts
 */
import * as dotenv from 'dotenv'
import * as path from 'path'
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || '{}')
if (!getApps().length) initializeApp({ credential: cert(serviceAccount) })
const db = getFirestore()

async function main() {
  const uid = process.env.SUPERADMIN_UID
  if (!uid) {
    console.error('Falta SUPERADMIN_UID en el entorno')
    process.exit(1)
  }

  await db.collection('users').doc(uid).set(
    { role: 'superadmin' },
    { merge: true }
  )

  console.log(`✓ Usuario ${uid} ahora es superadmin`)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
