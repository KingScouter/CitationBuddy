import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-guild-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './guild-detail.component.html',
  styleUrl: './guild-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GuildDetailComponent {}
