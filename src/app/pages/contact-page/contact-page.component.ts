import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';

interface ContactFormModel {
  firstName: string;
  lastName: string;
  email: string;
  description: string;
}
@Component({
  selector: 'app-contact-page',
  imports: [FormsModule],
  templateUrl: './contact-page.component.html',
  styleUrl: './contact-page.component.css',
})
export class ContactPageComponent {
  protected contactFormModel: ContactFormModel = {
    firstName: '',
    lastName: '',
    email: '',
    description: '',
  };

  protected isSubmitted = false;

  protected submitContactForm(contactForm: NgForm): void {
    if (contactForm.invalid) {
      contactForm.form.markAllAsTouched();
      return;
    }

    console.log('Contact form:', this.contactFormModel);

    contactForm.resetForm({
    firstName: '',
    lastName: '',
    email: '',
    description: '',
    });

    this.isSubmitted = true;
  }

  protected hideSuccessMessage(): void {
  this.isSubmitted = false;
}
}
