import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { AuthenticationService } from '../authentication/authentication.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, MatButtonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  private readonly authenticationService = inject(AuthenticationService);

  protected onLogin(): void {
    window.open(this.authenticationService.oauth2Url, '_self');
  }
}
