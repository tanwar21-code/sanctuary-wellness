import { NextRequest } from 'next/server';

/**
 * Extract Firebase UID from the Authorization header.
 * We verify the token client-side and pass the Firebase UID.
 * For production, you'd use firebase-admin to verify server-side.
 * Here we use a simpler approach: the client sends the UID in the header
 * after authenticating with Firebase.
 */
export async function getAuthUser(request: NextRequest): Promise<{ firebase_uid: string } | null> {
  const authHeader = request.headers.get('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const firebaseUid = authHeader.replace('Bearer ', '');
  
  if (!firebaseUid) {
    return null;
  }

  return { firebase_uid: firebaseUid };
}
