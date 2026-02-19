import { auth, db } from '@/lib/firebase';
import { createUserWithEmailAndPassword, updateProfile, User } from 'firebase/auth';
import { doc, setDoc, serverTimestamp, collection, addDoc } from 'firebase/firestore';
import { Usuario, Cliente } from '@/lib/types';
import { notificationService } from './notification.service';

interface RegisterData {
    email: string;
    password: string;
    fullName: string;
    phone?: string;
    tenantId: string; // The tenant they are registering for (e.g., 'demo-salon')
}

export const authService = {
    async registerUser(data: RegisterData): Promise<User> {
        const { email, password, fullName, phone, tenantId } = data;

        // 1. Create Auth User
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // 2. Update Auth Profile (Display Name)
        await updateProfile(user, { displayName: fullName });

        // 3. Create User Profile (users/{uid})
        // We use 'users' path to align with the new architecture, but checked layout.tsx uses 'usuarios' (legacy)
        // AND 'users/{uid}/memberships'. 
        // To be safe and compatible with AppLayout:
        // AppLayout checks 'users/{uid}/memberships' for role.
        // AppLayout checks 'usuarios/{uid}' for profile data.
        // We will write to BOTH until we fully migrate to 'users'.

        const userProfile: Usuario = {
            id: user.uid,
            nombre: fullName,
            email: email,
            rol: 'clienta',
            salonId: tenantId
        };

        // Write to Legacy Profile (for AppLayout compatibility)
        await setDoc(doc(db, 'usuarios', user.uid), userProfile);

        // 4. Create Membership (users/{uid}/memberships/{tenantId})
        await setDoc(doc(db, 'users', user.uid, 'memberships', tenantId), {
            role: 'clienta',
            tenantId: tenantId,
            joinedAt: serverTimestamp()
        });

        // 5. Create Customer Record (tenants/{tenantId}/customers)
        // This makes them appear in the Admin's client list immediately.
        const newCustomer: Omit<Cliente, 'id'> = {
            nombre: fullName.split(' ')[0],
            apellido: fullName.split(' ').slice(1).join(' ') || '',
            email: email,
            telefono: phone || '',
            fechaRegistro: serverTimestamp() as any, // Type cast for now
        };

        // ... previous code
        await setDoc(doc(db, 'tenants', tenantId, 'customers', user.uid), {
            ...newCustomer,
            userId: user.uid // Link back to auth user
        });

        // 6. Send Welcome Notification
        await notificationService.sendEmail({
            to: email,
            subject: '¡Bienvenida a Mujer!',
            type: 'welcome',
            data: { name: fullName }
        });

        return user;
    }
};
