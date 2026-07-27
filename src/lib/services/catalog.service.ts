import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, orderBy, doc, getDoc } from 'firebase/firestore';
import type { Service, Promotion, Staff, Tenant } from '@/lib/schema';

// Helper to get collection ref with type safety
const getTenantCollection = (tenantId: string, collectionName: string) =>
    collection(db, `tenants/${tenantId}/${collectionName}`);

export const catalogService = {

    async getServices(tenantId: string): Promise<Service[]> {
        try {
            const q = query(
                getTenantCollection(tenantId, 'services'),
                where('active', '==', true)
                // orderBy('name') // Requires index, maybe add later
            );
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Service));
        } catch (error) {
            console.error("Error fetching services:", error);
            return [];
        }
    },

    async getPromotions(tenantId: string): Promise<Promotion[]> {
        try {
            const q = query(
                getTenantCollection(tenantId, 'promotions'),
                where('active', '==', true)
            );
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Promotion));
        } catch (error) {
            console.error("Error fetching promotions:", error);
            return [];
        }
    },

    async getStaff(tenantId: string, branchId?: string): Promise<Staff[]> {
        try {
            let q;
            if (branchId) {
                q = query(
                    getTenantCollection(tenantId, 'staff'),
                    where('active', '==', true),
                    where('assignedBranchIds', 'array-contains', branchId)
                );
            } else {
                q = query(
                    getTenantCollection(tenantId, 'staff'),
                    where('active', '==', true)
                );
            }
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Staff));
        } catch (error) {
            console.error("Error fetching staff:", error);
            return [];
        }
    },

    async getTenantSettings(tenantId: string): Promise<Tenant | null> {
        try {
            const docRef = doc(db, 'tenants', tenantId);
            const snap = await getDoc(docRef);
            if (snap.exists()) {
                return { id: snap.id, ...snap.data() } as Tenant;
            }
            return null;
        } catch (error) {
            console.error("Error fetching tenant settings:", error);
            return null;
        }
    }
};
