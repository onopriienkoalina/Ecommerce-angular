import { Injectable, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  Auth,
  authState,
  createUserWithEmailAndPassword as firebaseCreateUserWithEmailAndPassword,
  signInWithEmailAndPassword as firebaseSignInWithEmailAndPassword,
  signOut as firebaseSignOut,
  type UserCredential,
  GoogleAuthProvider,
  signInWithPopup as firebaseSignInWithPopup,
} from '@angular/fire/auth';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly auth = inject(Auth);
  readonly user$ = authState(this.auth);
  readonly user = toSignal(this.user$, {
    initialValue: undefined,
  });
  readonly isAuthReady = computed(() => this.user() !== undefined);
  readonly isAuthenticated = computed(() => this.user() !== undefined && this.user() !== null);

  signInWithEmailAndPassword(email: string, password: string): Promise<UserCredential> {
    return firebaseSignInWithEmailAndPassword(this.auth, email, password);
  }

  signInWithGoogle(): Promise<UserCredential> {
    const provider = new GoogleAuthProvider();
    return firebaseSignInWithPopup(this.auth, provider);
  }
  signOut(): Promise<void> {
    return firebaseSignOut(this.auth);
  }
  registerWithEmailAndPassword(email: string, password: string): Promise<UserCredential> {
    return firebaseCreateUserWithEmailAndPassword(this.auth, email, password);
  }
}
