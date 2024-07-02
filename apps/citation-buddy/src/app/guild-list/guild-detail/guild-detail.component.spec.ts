import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GuildDetailComponent } from './guild-detail.component';

describe('GuildDetailComponent', () => {
  let component: GuildDetailComponent;
  let fixture: ComponentFixture<GuildDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GuildDetailComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(GuildDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
