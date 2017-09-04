import {NgModule} from "@angular/core";
import {RouterModule, Routes} from "@angular/router";
import {HomeComponent} from "../home/home.component";
import {MunicipalitiesComponent} from "../municipalities/municipalities.component";
import {ArchivalResourcesComponent} from "../archival-resources/archival-resources.component";
import {AboutComponent} from "../about/about.component";

/**
 * Defining the routes used in the app :
 *
 * / linked to the main part is in HomeComponent
 * /municipalities linked to the MunicipalitiesComponent
 * /about linked to the AboutComponent
 * /municipalities/:id/archival-resources linked to the ArchivalResourcesComponent
 * /not-found linked to the ErrorPageComponent with the message data 'page not found'
 * every other URLs redirect to the /not-found URL
 *
 * @type {[{path: string; component: HomeComponent},{path: string; component: MunicipalitiesComponent},{path: string; component: AboutComponent},{path: string; component: ArchivalResourcesComponent}]}
 */
const appRoutes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'municipalities', component: MunicipalitiesComponent },
  { path: 'about', component: AboutComponent },
  { path: 'municipalities/:id/archival-resources', component: ArchivalResourcesComponent },
  // { path: 'not-found', component: ErrorPageComponent, data: {message: 'Page not found!'} },
  { path: '**', redirectTo: ''}
];

/**
 * Module used to manage the routing in the app
 *
 * The routes are imported in the import part through the forRoot() method
 *
 * The module have to be exported to be then imported in the app.module.ts
 */
@NgModule({
  imports: [
    //RouterModule.forRoot(appRoutes, {userHash: true})
    RouterModule.forRoot(appRoutes)
  ],
  exports: [
    RouterModule
  ]
})

export class AppRoutingModule{}
