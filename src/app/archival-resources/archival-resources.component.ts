import {Component, OnInit, Input, OnDestroy, ViewChild} from '@angular/core';
import {ArchivalResourcesService} from "./archival-resources.service";
import {MunicipalitiesService} from "../municipalities/municipalities.service";
import {MunicipalityVersion} from "../objects/municipality-version";
import {Router, ActivatedRoute, Data, Params} from "@angular/router";
import {ArchivalResources} from "../objects/archival-resources";
import { DomSanitizer } from '@angular/platform-browser';
import {GenericTableComponent, GtConfig} from "@angular-generic-table/core";
import {CustomRowComponent} from "../custom-row/custom-row.component";
import {Subscription} from "rxjs";

const swissArchiveURL: string = 'https://www.swiss-archives.ch/detail.aspx?id=';

@Component({
  selector: 'app-archival-resources',
  templateUrl: './archival-resources.component.html',
  styleUrls: ['./archival-resources.component.css']
})
export class ArchivalResourcesComponent implements OnInit, OnDestroy {

  @ViewChild(GenericTableComponent)
  private archivalResourcesTable: GenericTableComponent<any, CustomRowComponent>;

  loading: boolean;
  options: MunicipalityVersion[];
  versionId: number;
  currentMunicipalityVersion: MunicipalityVersion;
  archivalResources: ArchivalResources[];
  related: MunicipalityVersion[];
  active: MunicipalityVersion;

  //Period
  startPeriod: number[];
  endPeriod: number[];

  //History
  history: any[];
  historyCheckBoxField: string[];

  //Map
  mapActive: boolean = false;
  mapPartialUrl: string = '//map.geo.admin.ch/?ch.swisstopo.swissboundaries3d-gemeinde-flaeche.fill=';
  mapUrl: string;

  //List
  configObject: GtConfig<any>;
  settings = [];
  fields = [];

  //Subscriptions
  getAllMunicipalitiesSubscription: Subscription;
  getArchivalResourcesMatchingNamesSubscription: Subscription;
  routeSubscription: Subscription;

  constructor(public sanitizer: DomSanitizer,
              private route: ActivatedRoute,
              private router: Router,
              private archivalResourcesService: ArchivalResourcesService,
              private municipalitiesService: MunicipalitiesService) {
    this.settings = this.constructListSettings();
    this.fields = this.constructListFields();
    this.configObject = null;

    this.startPeriod = [];
    this.endPeriod = [];
  }

  ngOnInit() {
    this.loading = true;

    let currentYear: number = new Date().getFullYear();

    for(let i=1848; i<currentYear; i+=10){
      this.startPeriod.push(i);
      this.endPeriod.push(i);
    }

    this.getAllMunicipalitiesSubscription =
      this.municipalitiesService.getAllMunicipalities().subscribe(
        (elements: any[]) => this.options = elements,
        (error) => console.log(error),
        () => {
          this.routeSubscription =
            this.route.params.subscribe(
              (params: Params) => {

                this.versionId = params['id'];

                this.currentMunicipalityVersion = this.options.find(x => x.id == this.versionId);

                this.related = this.getRelatedVersions(this.currentMunicipalityVersion);

                this.active = this.getActive(this.currentMunicipalityVersion);
                //Active Municipality for the map
                this.mapUrl = this.mapPartialUrl + this.active.municipality;
                this.mapActive = true;

                this.history = this.constructHistory(this.related);

                this.historyCheckBoxField = [this.currentMunicipalityVersion.name];

                for(let element of this.related){
                  if(this.historyCheckBoxField.indexOf(element.name) == -1){
                    this.historyCheckBoxField.push(element.name);
                  }
                }

                //this.afterLoadRelated(this.related);
                this.loading = false;
              }
            );
        }
      );

    /*this.route.params.subscribe(
     (params: Params) => {
     this.versionId = params['id'];
     this.getRelatedMunicipalities(this.versionId);
     }
     );*/
  }

  ngOnDestroy() {
    if(this.getAllMunicipalitiesSubscription)
      this.getAllMunicipalitiesSubscription.unsubscribe();
    if(this.routeSubscription)
      this.routeSubscription.unsubscribe();
    if(this.getArchivalResourcesMatchingNamesSubscription)
      this.getArchivalResourcesMatchingNamesSubscription.unsubscribe();
  }

  private afterLoadRelated(related: MunicipalityVersion[]): void {
    this.archivalResourcesService
      .getArchivalResourcesMatchingNames(this.constructNamesString(related))
      .subscribe(
        (elements: any[]) => this.archivalResources = elements,
        (error) => {
          console.log(error);
          this.configObject = {
            settings: this.settings,
            fields: this.fields,
            data: [null]
          };
          this.loading = false;
        },
        () => {
          this.configObject = {settings: this.settings, fields: this.fields, data: this.options};
          this.loading = false;
        }
      );
  }

  private constructHistory(related: MunicipalityVersion[]): any[] {
    let history: any[] = [];
    let work: MunicipalityVersion[] = [];

    work.push(this.currentMunicipalityVersion);

    if (related.length != 0) {
      for (let m of related) {
        if (m.name == this.currentMunicipalityVersion.name) {
          work.push(m);
        }
      }
    }

    for (let w of work) {
      for (let r of related) {
        if (r.abolitionMutation && w.name != r.name && w.admissionMutation.id == r.abolitionMutation.id) {
          if(!history.find(x => x.id == r.id)){
            history.push({
              'label': "other",
              'name': r.name,
              'id': r.id,
              'date': r.abolitionMutation.date,
              'mutation': w.admissionMutation.mutationLabel
            });
          }
        }
        if (w.abolitionMutation && w.name != r.name && w.abolitionMutation.id == r.admissionMutation.id) {
          if(!history.find(x => x.id == r.id)){
            history.push({
              'label': "other",
              'name': r.name,
              'id': r.id,
              'date': r.admissionMutation.date,
              'mutation': r.admissionMutation.mutationLabel
            });
          }
        }
      }
    }

    history.sort((a: any, b: any) => {
      if (a.date < b.date) {
        return -1;
      }
      else if (a.date > b.date) {
        return 1;
      }
      else {
        return 0;
      }
    });

    return history;
  }

  private constructNamesString(relatedVersions: MunicipalityVersion[]): string{
    let names: string = '';

    names = names + "\"" + this.currentMunicipalityVersion.name + "\"";

    if(relatedVersions.length > 0){
      for (let version of relatedVersions) {
        if (names.indexOf(version.name) == -1) {
          names = names + " OR " + "\"" + version.name + "\"";
        }
      }
    }

    return names;
  }

  private getRelatedVersions(current: MunicipalityVersion): MunicipalityVersion[] {
    let sameM: MunicipalityVersion[] = [];

    for (const option of this.options) {
      if (current.municipality == option.municipality) {
        sameM.push(option);
      }
    }

    let related: MunicipalityVersion[] = [];

    for (const same of sameM) {
      for (const option of this.options) {
        if (same.abolitionMutation) {
          if (same.abolitionMutation.id == option.admissionMutation.id) {
            related.push(option);
          }
        }
        if (option.abolitionMutation) {
          if (related.indexOf(option) == -1) {
            if (same.admissionMutation.id == option.abolitionMutation.id) {
              related.push(option);
            }
          }
        }
      }
    }
    return related;
  }

  private getActive(currentVersion: MunicipalityVersion): MunicipalityVersion {
    let active: MunicipalityVersion = null;
    let relatedVersions: MunicipalityVersion[];

    //Test if current is an active version
    if(!currentVersion.abolitionMutation){
      return currentVersion;
    }

    //Get related versions of current
    relatedVersions = this.getRelatedVersions(currentVersion);

    //Search active version
    for (let version of relatedVersions) {
      if (!version.abolitionMutation) {
        active = version;
      }
    }

    if(active)
      return active;

    if(relatedVersions.length > 1){
      //Sort the table, first element is most recent
      relatedVersions.sort((a: any, b: any) => {
        if (a.abolitionMutation.date > b.abolitionMutation.date) {
          return -1;
        }
        else if (a.abolitionMutation.date < b.abolitionMutation.date) {
          return 1;
        }
        else {
          return 0;
        }
      });
    }

    //Launch get active with most recent related version
    return this.getActive(relatedVersions[0]);
  }

  private constructListSettings(): any[]{
    return [{
      objectKey:'id',
      sort:'disable',
      visible:false,
      columnOrder:0,
      search: false
    },{
      objectKey:'signature',
      sort:'enable',
      columnOrder:1,
      search: true
    },{
      objectKey:'titre',
      sort:'enable',
      columnOrder:2,
      search: false
    },{
      objectKey:'startDate',
      sort:'enable',
      columnOrder:3,
      search: false
    },{
      objectKey: 'endDate',
      sort: 'disable',
      columnOrder: 4,
      search: false
    },{
      objectKey: 'abolitionLabel',
      sort: 'disable',
      visible: true,
      columnOrder: 5,
      search: false
    },{
      objectKey: 'swissArchiveButton',
      columnOrder: 6,
      sort: 'disable',
      search: false
    }];
  }

  private constructListFields(): any[]{
    return [{
      name:'Signature',
      objectKey:'signature',
      classNames: 'sort-string'
    },{
      name:'Titre',
      objectKey:'title',
      classNames: 'sort-string'
    },{
      name:'Date de début',
      objectKey:'startDate',
      classNames: 'sort-string',
      value: function(row){
        if(row.startDate){
          return row.startDate;
        }
        return '';
      }
    },{
      name:'Date de fin',
      objectKey:'endDate',
      classNames: 'clickable sort-numeric',
      value: function(row){
        if(row.endDate){
          return row.endDate;
        }
        return '';
      }
    },{
      objectKey: 'swissArchiveButton', name: '',
      value: () => '',
      render: () => ' <a class="btn btn-primary"> Swiss Archive </button>',
      click: (row) => window.open(swissArchiveURL+row.id, "_blank")
    }];
  }
}
