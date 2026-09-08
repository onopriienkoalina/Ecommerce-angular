import { EnvironmentInjector, inject, Injectable, runInInjectionContext } from '@angular/core';
import { doc, Firestore, setDoc, getDoc } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly firestore = inject(Firestore);
  private readonly injector = inject(EnvironmentInjector);

  createCustomerUser(uid: string): Promise<void> {
    return runInInjectionContext(this.injector, () => {
      const userDocument = doc(this.firestore, 'users', uid);

      return setDoc(userDocument, {
        role: 'customer',
      });
    });
  }
  ensureCustomerUser(uid: string): Promise<void> {
    return runInInjectionContext(this.injector, async () => {
      const userDocument = doc(this.firestore, 'users', uid);
      const snapshot = await getDoc(userDocument);
      if (snapshot.exists()) {
        return;
      }
      await setDoc(userDocument, {
        role: 'customer',
      });
    });
  }
}
