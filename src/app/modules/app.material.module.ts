import {
  MdButtonModule,
  MdInputModule,
  MdAutocompleteModule,
  MdListModule,
  MdProgressSpinnerModule, MdProgressBarModule, MdSelectModule, MdSelectionModule
} from '@angular/material';

import {NgModule} from "@angular/core";

@NgModule({
  imports: [
    MdButtonModule,
    MdInputModule,
    MdAutocompleteModule,
    MdListModule,
    MdProgressSpinnerModule
  ],
  exports: [
    MdButtonModule,
    MdInputModule,
    MdAutocompleteModule,
    MdListModule,
    MdProgressSpinnerModule,
    MdProgressBarModule,
    MdSelectModule,
    MdSelectionModule
  ],
})
export class AppMaterialModule { }
