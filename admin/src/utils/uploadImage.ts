import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import app from '../config/firebase';

const storage = getStorage(app);

/**
 * Uploads an image file to Firebase Storage and returns the public download URL.
 * @param file  - The File object to upload
 * @param folder - Storage folder, e.g. 'categories' | 'products'
 */
export async function uploadImage(file: File, folder: string = 'general'): Promise<string> {
  const safeFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
  const storagePath = `admin/${folder}/${unique}-${safeFileName}`;

  const storageRef = ref(storage, storagePath);
  const uploadTask = uploadBytesResumable(storageRef, file, {
    contentType: file.type,
  });

  return new Promise((resolve, reject) => {
    uploadTask.on(
      'state_changed',
      null, // no progress handler needed
      (error) => reject(error),
      async () => {
        try {
          const url = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(url);
        } catch (err) {
          reject(err);
        }
      }
    );
  });
}
