import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-oauth-error',
  standalone: true,
  imports: [CommonModule],
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
