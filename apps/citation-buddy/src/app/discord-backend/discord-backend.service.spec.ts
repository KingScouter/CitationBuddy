import { TestBed } from '@angular/core/testing';

import { DiscordBackendService } from './discord-backend.service';

describe('DiscordBackendService', () => {
  let service: DiscordBackendService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DiscordBackendService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
