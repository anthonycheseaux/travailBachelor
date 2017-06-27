import {
  MdButtonModule,
  MdInputModule,
  MdAutocompleteModule,
  MdListModule,
  MdProgressSpinnerModule, MdProgressBarModule, MdSelectModule
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
    MdSelectModule
  ],
})
export class AppMaterialModule { }
