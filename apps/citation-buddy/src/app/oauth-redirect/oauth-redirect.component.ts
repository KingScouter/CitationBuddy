import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthenticationService } from '../authentication/authentication.service';

@Component({
  selector: 'app-oauth-redirect',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './oauth-redirect.component.html',
  styleUrl: './oauth-redirect.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OauthRedirectComponent implements OnInit {
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly authenticationService = inject(AuthenticationService);
  private readonly router = inject(Router);

  ngOnInit(): void {
    this.authenticationService.setAuthByUrlFragments(
      this.activatedRoute.snapshot.fragment ?? ''
    );

    setTimeout(() => {
      this.router.navigate(['']);
    }, 3000);
  }
}
