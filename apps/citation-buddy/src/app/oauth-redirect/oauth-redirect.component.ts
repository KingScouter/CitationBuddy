import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
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

  /**
   * OnInit-lifecycle. Automatically redirects the user to the main-screen after a given timeout
   */
  ngOnInit(): void {
    setTimeout(() => {
      this.router.navigate([AppRoutes.Guilds]);
    }, 1500);
  }
}
