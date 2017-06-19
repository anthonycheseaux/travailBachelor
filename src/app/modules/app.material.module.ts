import {
  MdButtonModule,
  MdInputModule,
  MdAutocompleteModule,
  MdListModule,
  MdProgressSpinnerModule
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
    MdProgressSpinnerModule
  ],
})
export class AppMaterialModule { }
