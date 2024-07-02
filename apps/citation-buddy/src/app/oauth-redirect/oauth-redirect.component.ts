import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthenticationService } from '../authentication/authentication.service';
import { AppRoutes } from '../models';

@Component({
  selector: 'app-oauth-redirect',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './oauth-redirect.component.html',
  styleUrl: './oauth-redirect.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OauthRedirectComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly authenticationService = inject(AuthenticationService);

  ngOnInit(): void {
    this.authenticationService.checkAuthentication();
    setTimeout(() => {
      this.router.navigate([AppRoutes.Guilds]);
    }, 3000);
  }
}
