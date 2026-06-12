import { Routes } from '@angular/router';
import { MainPageComponent } from './pages/main-page/main-page.component';
import { ContactPageComponent } from './pages/contact-page/contact-page.component';

export const routes: Routes = [
  { path: '', component: MainPageComponent },
  { path: 'contacts', component: ContactPageComponent }
];
