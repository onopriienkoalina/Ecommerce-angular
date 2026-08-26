import { EnvironmentInjector, inject, Injectable, runInInjectionContext } from '@angular/core';
import { doc, Firestore, setDoc } from '@angular/fire/firestore';

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
}
