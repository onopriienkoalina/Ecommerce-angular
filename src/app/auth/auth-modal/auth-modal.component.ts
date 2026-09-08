import { Component, inject, signal, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../auth.service';
import { UserService } from '../user.service';
@Component({
  selector: 'app-auth-modal',
  imports: [ReactiveFormsModule],
  templateUrl: './auth-modal.component.html',
  styleUrl: './auth-modal.component.css',
})
export class AuthModalComponent {
  private readonly authService = inject(AuthService);
  private readonly formBuilder = inject(FormBuilder);
  protected readonly closed = output<void>();
  protected readonly isSigningIn = signal(false);
  protected readonly signInError = signal<string | null>(null);
  protected readonly showPassword = signal(false);
  protected readonly isRegisterMode = signal(false);
  private readonly userService = inject(UserService);
  protected readonly signInForm = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  protected async submitAuth(): Promise<void> {
    if (this.signInForm.invalid) {
      this.signInForm.markAllAsTouched();
      return;
    }
    this.signInError.set(null);
    this.isSigningIn.set(true);

    const formValue = this.signInForm.getRawValue();
    const email = formValue.email;
    const password = formValue.password;

    try {
      if (this.isRegisterMode()) {
        const userCredential = await this.authService.registerWithEmailAndPassword(email, password);
        await this.userService.createCustomerUser(userCredential.user.uid);
      } else {
        await this.authService.signInWithEmailAndPassword(email, password);
      }
      this.closeModal();
    } catch (error: unknown) {
      console.error('Authentication error:', error);
      if (this.isRegisterMode()) {
        this.signInError.set('Unable to create account. Check your email and password.');
      } else {
        this.signInError.set('Unable to sign in. Check your email and password.');
      }
    } finally {
      this.isSigningIn.set(false);
    }
  }
  protected async signInWithGoogle(): Promise<void> {
    this.signInError.set(null);
    this.isSigningIn.set(true);
    try {
      const userCredential = await this.authService.signInWithGoogle();
      await this.userService.ensureCustomerUser(userCredential.user.uid);
      this.closeModal();
    } catch (error: unknown) {
      console.error('Sign in error:', error);
      this.signInError.set('Unable to sign in with Google.');
    } finally {
      this.isSigningIn.set(false);
    }
  }
  protected closeModal(): void {
    this.closed.emit();
  }
  protected handleBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.closeModal();
    }
  }
  protected togglePasswordVisibility(): void {
    this.showPassword.update((value) => !value);
  }
  protected toggleAuthMode(): void {
    this.isRegisterMode.update((isRegisterMode) => !isRegisterMode);

    this.signInError.set(null);
    this.signInForm.reset();
  }
}
