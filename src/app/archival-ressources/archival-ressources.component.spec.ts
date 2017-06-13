import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ArchivalRessourcesComponent } from './archival-ressources.component';

describe('ArchivalRessourcesComponent', () => {
  let component: ArchivalRessourcesComponent;
  let fixture: ComponentFixture<ArchivalRessourcesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ArchivalRessourcesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ArchivalRessourcesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
