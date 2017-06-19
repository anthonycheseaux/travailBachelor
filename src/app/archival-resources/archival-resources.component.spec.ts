import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ArchivalResourcesComponent } from './archival-resources.component';

describe('ArchivalResourcesComponent', () => {
  let component: ArchivalResourcesComponent;
  let fixture: ComponentFixture<ArchivalResourcesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ArchivalResourcesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ArchivalResourcesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
