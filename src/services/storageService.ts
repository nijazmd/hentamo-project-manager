import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage, isFirebaseConfigured } from './firebase';
import { Attachment } from '../types';

export const storageService = {
  async uploadAttachment(file: File, folder: string = 'attachments'): Promise<Attachment> {
    const id = 'att-' + Math.random().toString(36).substring(2, 9);
    const now = new Date().toISOString();

    if (isFirebaseConfigured && storage) {
      const storagePath = `${folder}/${Date.now()}_${file.name}`;
      const storageRef = ref(storage, storagePath);
      await uploadBytes(storageRef, file);
      const downloadUrl = await getDownloadURL(storageRef);

      return {
        id,
        name: file.name,
        url: downloadUrl,
        path: storagePath,
        size: file.size,
        type: file.type,
        createdAt: now,
      };
    }

    // Fallback: Read file as Data URL locally
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve({
          id,
          name: file.name,
          url: reader.result as string,
          path: `local/${file.name}`,
          size: file.size,
          type: file.type,
          createdAt: now,
        });
      };
      reader.onerror = error => reject(error);
      reader.readAsDataURL(file);
    });
  },
};
