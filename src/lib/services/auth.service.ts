import { auth, db, storage } from '@/lib/firebase';
import { createUserWithEmailAndPassword, updateProfile, User } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

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

        // 2. WRITE TO SOURCE OF TRUTH (users/{uid})
        // Mapping schema: displayName, email, phone, photoURL
        await setDoc(doc(db, 'users', user.uid), {
            id: user.uid,
            displayName: fullName,
            email: email,
            phone: phone || null,
            photoURL: null, // Will update after upload
            createdAt: serverTimestamp()
        });

        // Write Membership
        await setDoc(doc(db, 'users', user.uid, 'memberships', tenantId), {
            role: 'customer',
            tenantId: tenantId,
            joinedAt: serverTimestamp()
        });

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
            // Update New
            await setDoc(doc(db, 'users', user.uid), { photoURL: photoURL }, { merge: true });
        }

        // 5. Create Customer Record (tenants/{tenantId}/customers)
        await setDoc(doc(db, 'tenants', tenantId, 'customers', user.uid), {
            userId: user.uid,
            fullName,
            email,
            phone: phone || null,
            createdAt: serverTimestamp(),
        });

        return user;
    }
};
