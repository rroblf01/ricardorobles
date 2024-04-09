import { Component } from '@angular/core';

@Component({
  selector: 'app-certs',
  standalone: true,
  imports: [],
  templateUrl: './certs.component.html',
})
export class CertsComponent {
  certs: {
    title: string;
    description: string;
    imgPath: string;
  }[] = [
    {
      title: 'AWS Certified Cloud Practitioner',
      description: 'Certificación de AWS que valida la comprensión de los conceptos básicos de la nube.',
      imgPath: 'assets/cloud-practitioner.webp'
    }
  ];
}
