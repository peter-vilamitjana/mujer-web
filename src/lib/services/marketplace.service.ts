/**
 * marketplace.service.ts
 *
 * Usa la Firestore REST API directamente en lugar del client SDK.
 * Esto evita el problema de inicialización del SDK en Server Components.
 * Para colecciones públicas (allow read: if true) no se necesita token de auth.
 */

import type { Tenant, Service, Staff } from '@/lib/schema';
import { firestoreRestBase } from '@/lib/firebase-rest-base';

const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'mujer-app';
const FIRESTORE_BASE = firestoreRestBase(PROJECT_ID);

/**
 * Convierte un valor de Firestore REST API al tipo JS correspondiente.
 */
function parseFirestoreValue(value: any): any {
  if (value === undefined || value === null) return null;
  if ('stringValue' in value) return value.stringValue;
  if ('integerValue' in value) return parseInt(value.integerValue, 10);
  if ('doubleValue' in value) return value.doubleValue;
  if ('booleanValue' in value) return value.booleanValue;
  if ('nullValue' in value) return null;
  if ('timestampValue' in value) return new Date(value.timestampValue);
  if ('mapValue' in value) {
    const fields = value.mapValue?.fields || {};
    return Object.fromEntries(
      Object.entries(fields).map(([k, v]) => [k, parseFirestoreValue(v)])
    );
  }
  if ('arrayValue' in value) {
    return (value.arrayValue?.values || []).map(parseFirestoreValue);
  }
  return null;
}

/**
 * Convierte un documento de Firestore REST API a un objeto JS plano.
 */
function parseFirestoreDoc(doc: any): Record<string, any> {
  const fields = doc.fields || {};
  const parsed: Record<string, any> = {};
  for (const [key, value] of Object.entries(fields)) {
    parsed[key] = parseFirestoreValue(value);
  }
  // Extraer el ID del documento desde el name (último segmento del path)
  const nameParts = (doc.name || '').split('/');
  parsed._id = nameParts[nameParts.length - 1];
  return parsed;
}

/**
 * Ejecuta una query structuredQuery contra la Firestore REST API.
 */
async function firestoreQuery(
  collectionPath: string,
  filters: Array<{ field: string; op: string; value: any }>,
  limitCount?: number
): Promise<Record<string, any>[]> {
  const url = `${FIRESTORE_BASE}:runQuery`;

  // Construir filtros
  const fieldFilters = filters.map(f => ({
    fieldFilter: {
      field: { fieldPath: f.field },
      op: f.op,
      value: typeof f.value === 'boolean'
        ? { booleanValue: f.value }
        : typeof f.value === 'number'
        ? { integerValue: String(f.value) }
        : { stringValue: String(f.value) }
    }
  }));

  const structuredQuery: any = {
    from: [{ collectionId: collectionPath.split('/').pop() }],
    where: fieldFilters.length === 1
      ? fieldFilters[0]
      : { compositeFilter: { op: 'AND', filters: fieldFilters } },
  };

  // Agregar parent si es subcolección
  const pathParts = collectionPath.split('/');
  if (pathParts.length > 1) {
    const parentPath = pathParts.slice(0, -1).join('/');
    structuredQuery.from = [{
      collectionId: pathParts[pathParts.length - 1],
    }];
    // Para subcolecciones, usar el parent en la URL
    const parentUrl = `${FIRESTORE_BASE}/${parentPath}:runQuery`;
    if (limitCount) structuredQuery.limit = limitCount;

    const res = await fetch(parentUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ structuredQuery }),
      cache: 'no-store',
    });

    if (!res.ok) {
      console.error('[marketplace.service] Firestore REST error:', await res.text());
      return [];
    }

    const results = await res.json();
    return results
      .filter((r: any) => r.document)
      .map((r: any) => parseFirestoreDoc(r.document));
  }

  if (limitCount) structuredQuery.limit = limitCount;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ structuredQuery }),
    cache: 'no-store',
  });

  if (!res.ok) {
    console.error('[marketplace.service] Firestore REST error:', await res.text());
    return [];
  }

  const results = await res.json();
  return results
    .filter((r: any) => r.document)
    .map((r: any) => parseFirestoreDoc(r.document));
}

/**
 * Retorna todos los tenants con isActivePublicly === true.
 */
export async function getPublicSalons(): Promise<Tenant[]> {
  const docs = await firestoreQuery(
    'tenants',
    [{ field: 'isActivePublicly', op: 'EQUAL', value: true }],
    50
  );
  return docs.map(d => ({ ...d, id: d._id } as unknown as Tenant));
}

/**
 * Retorna un tenant por su slug público.
 */
export async function getSalonBySlug(slug: string): Promise<Tenant | null> {
  const docs = await firestoreQuery(
    'tenants',
    [
      { field: 'slug', op: 'EQUAL', value: slug },
      { field: 'isActivePublicly', op: 'EQUAL', value: true },
    ],
    1
  );
  if (docs.length === 0) return null;
  return { ...docs[0], id: docs[0]._id } as unknown as Tenant;
}

/**
 * Retorna los servicios activos de un tenant.
 */
export async function getSalonServices(tenantId: string): Promise<Service[]> {
  const docs = await firestoreQuery(
    `tenants/${tenantId}/services`,
    [{ field: 'active', op: 'EQUAL', value: true }]
  );
  return docs.map(d => ({ ...d, id: d._id } as unknown as Service));
}

/**
 * Retorna el staff activo de un tenant.
 */
export async function getSalonStaff(tenantId: string): Promise<Staff[]> {
  const docs = await firestoreQuery(
    `tenants/${tenantId}/staff`,
    [{ field: 'active', op: 'EQUAL', value: true }]
  );
  return docs.map(d => ({ ...d, id: d._id } as unknown as Staff));
}
