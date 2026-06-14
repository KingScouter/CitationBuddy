import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
} from '@angular/core';

import { Router } from '@angular/router';

@Component({
  selector: 'app-oauth-error',
  standalone: true,
  imports: [],
  templateUrl: './oauth-error.component.html',
  styleUrl: './oauth-error.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OauthErrorComponent implements OnInit {
  private readonly router = inject(Router);

  ngOnInit(): void {
    setTimeout(() => {
      this.router.navigate(['']);
    }, 3000);
  }
}
