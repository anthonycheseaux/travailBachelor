import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { MunicipalitiesComponent } from './municipalities/municipalities.component';
import {ArchivalResourcesComponent} from './archival-resources/archival-resources.component';
import { AppRoutingModule } from './modules/app.routing.module';
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {AppMaterialModule} from "./modules/app.material.module";
import {ReactiveFormsModule, FormsModule} from "@angular/forms";
import {MunicipalitiesService} from "./municipalities/municipalities.service";
import {HttpModule} from "@angular/http";
import {GenericTableModule} from "@angular-generic-table/core";
import {ColumnSettingsModule} from "@angular-generic-table/column-settings";
import {CustomRowComponent } from './custom-row/custom-row.component';
import { AboutComponent } from './about/about.component';

/**
 * Components in the declarations part
 * Modules in the imports part
 * Service (one instance in the app) in the providers part
 * Main component in bootstrap part
 */
@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    MunicipalitiesComponent,
    ArchivalResourcesComponent,
    CustomRowComponent,
    AboutComponent
  ],
  imports: [
    BrowserModule,
    HttpModule,
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule,
    AppMaterialModule,
    BrowserAnimationsModule,
    GenericTableModule,
    ColumnSettingsModule
  ],
  providers: [
    MunicipalitiesService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
