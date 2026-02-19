import { auth, db, storage } from '@/lib/firebase';
import { createUserWithEmailAndPassword, updateProfile, User } from 'firebase/auth';
import { doc, setDoc, serverTimestamp, collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Usuario, Cliente } from '@/lib/types';
import { notificationService } from './notification.service';

interface RegisterData {
    email: string;
    password: string;
    fullName: string;
    phone?: string;
    tenantId: string;
    photo?: File;
    photoBase64?: string;
}

export const authService = {
    async registerUser(data: RegisterData): Promise<User> {
        const { email, password, fullName, phone, tenantId, photo } = data;

        // 1. Create Auth User
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // 2. PRE-CREATE User Profile (Critical for AppLayout)
        const userProfile: Usuario = {
            id: user.uid,
            nombre: fullName,
            email: email,
            rol: 'clienta',
            salonId: tenantId
        };

        // Write to Legacy Profile (for AppLayout compatibility)
        await setDoc(doc(db, 'usuarios', user.uid), userProfile);

        // Write Membership
        await setDoc(doc(db, 'users', user.uid, 'memberships', tenantId), {
            role: 'clienta',
            tenantId: tenantId,
            joinedAt: serverTimestamp()
        });

        // 3. Upload Photo (Async / Optional)
        // 3. Upload Photo (Async / Optional)
        let photoURL = data.photoBase64 || '';

        if (photo && storage && storage.app) {
            try {
                console.log("Debug: Attempting Storage upload...", photo.name);
                const storageRef = ref(storage, `profile-pictures/${user.uid}`);

                // Enforce 5s timeout to prevent hanging
                const uploadTask = uploadBytes(storageRef, photo);
                const timeoutPromise = new Promise((_, reject) =>
                    setTimeout(() => reject(new Error("Upload timeout")), 5000)
                );

                await Promise.race([uploadTask, timeoutPromise]);

                const downloadURL = await getDownloadURL(storageRef);
                console.log("Debug: Upload success. URL:", downloadURL);
                photoURL = downloadURL;
            } catch (error) {
                console.error("Debug: Upload failed or timed out (using Base64 fallback):", error);
            }
        }

        // 4. Update Auth Profile & Firestore
        // Only use storage URL for Auth Profile (size limit)
        const authPhotoURL = photoURL.startsWith('http') ? photoURL : null;
        await updateProfile(user, { displayName: fullName, photoURL: authPhotoURL });

        // Update Firestore (Can hold Base64)
        if (photoURL) {
            await setDoc(doc(db, 'usuarios', user.uid), { ...userProfile, photoURL: photoURL }, { merge: true });
        }

        // 5. Create Customer Record (tenants/{tenantId}/customers)
        // This makes them appear in the Admin's client list immediately.
        const newCustomer: Omit<Cliente, 'id'> = {
            nombre: fullName.split(' ')[0],
            apellido: fullName.split(' ').slice(1).join(' ') || '',
            email: email,
            telefono: phone || '',
            fechaRegistro: serverTimestamp() as any, // Type cast for now
        };

        await setDoc(doc(db, 'tenants', tenantId, 'customers', user.uid), {
            ...newCustomer,
            userId: user.uid // Link back to auth user
        });

        // 6. Send Welcome Notification (Non-blocking)
        notificationService.sendEmail({
            to: email,
            subject: '¡Bienvenida a Mujer!',
            type: 'welcome',
            data: { name: fullName }
        }).catch(err => console.error("Background email error:", err));

        return user;
    }
};
