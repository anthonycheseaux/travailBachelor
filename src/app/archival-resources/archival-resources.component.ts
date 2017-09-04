import {Component, OnInit, OnDestroy, ViewChild, OnChanges} from '@angular/core';
import {ArchivalResourcesService} from "./archival-resources.service";
import {MunicipalitiesService} from "../municipalities/municipalities.service";
import {MunicipalityVersion} from "../objects/municipality-version";
import {Router, ActivatedRoute, Params} from "@angular/router";
import {ArchivalResources} from "../objects/archival-resources";
import { DomSanitizer } from '@angular/platform-browser';
import {GenericTableComponent, GtConfig} from "@angular-generic-table/core";
import {CustomRowComponent} from "../custom-row/custom-row.component";
import {Subscription} from "rxjs";

/**
 * Interface used to manage filters on applied on the list
 */
interface IFilters{
  title?:string[];
  startDate?:number[];
  endDate?:number[];
}

const swissArchiveURL: string = 'https://www.swiss-archives.ch/detail.aspx?id=';

@Component({
  selector: 'app-archival-resources',
  templateUrl: './archival-resources.component.html',
  styleUrls: ['./archival-resources.component.css'],
  providers: [ArchivalResourcesService]
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
  startPeriodFilter: number[];
  endPeriod: number[];
  endPeriodFilter: number[];
  invalidPeriod: boolean;
  invalidPeriodMessage: string;

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

  error: boolean;

  archivalResourcesTemp: ArchivalResources[];

  constructor(public sanitizer: DomSanitizer,
              private route: ActivatedRoute,
              private router: Router,
              private archivalResourcesService: ArchivalResourcesService,
              private municipalitiesService: MunicipalitiesService) {
    this.settings = this.constructListSettings();
    this.fields = this.constructListFields();
    this.configObject = null;

    this.error = false;

    this.startPeriod = [];
    this.endPeriod = [];
    this.startPeriodFilter = [];
    this.endPeriodFilter = [];

    this.invalidPeriod = false;
    this.invalidPeriodMessage = 'La période sélectionnée n\'est pas valide !';

    let currentYear: number = new Date().getFullYear();

    for(let i=1000; i<currentYear; i++){
      this.startPeriodFilter.push(i);
      this.endPeriodFilter.push(i);
    }

    for(let i=1848; i<currentYear; i+=10){
      this.startPeriod.push(i);
      this.endPeriod.push(i);
    }

    this.archivalResourcesTemp = [
      new ArchivalResources(1288432, "http://data.alod.ch/bar/id/archivalresource/1288432", "Thurgau. Abwässer aus der Putzfädenfabrik & Wäscherei Ernst Ruckstuhl in Friedtal-Aawangen", "E3270A#1000/755#611*", 1930, null),
      new ArchivalResources(3354901, "http://data.alod.ch/bar/id/archivalresource/3354901", "TG 8320001, Parz. Nr. 349 Militäranlagen Munitionsdepo Simmen - Ettenhausen", "E3360-02#2006/1#3910*", 1983	, 1983),
      new ArchivalResources(2125911, "http://data.alod.ch/bar/id/archivalresource/2125911", "Leutnant Wolfender, Aadorf", "E5001F#1000/1851#2353*", 1950, null),
      new ArchivalResources(2397965, "http://data.alod.ch/bar/id/archivalresource/2397965", "	Projekt-Nr. 20-133: Kanton Thurgau, Tiefbauamt, Guntershausen: Ausbau der Staatstrasse Aadorf-Guntershausen", "E7291B#1980/16#1815*", 1976, 1977)
    ]
  }

  ngOnInit() {
    this.loading = true;

    this.routeSubscription =
      this.route.params.subscribe(
        (params: Params) => {

          this.loading = true;

          this.versionId = params['id'];

          this.getAllMunicipalitiesSubscription =
            this.municipalitiesService.getAllMunicipalities().subscribe(
              (elements: any[]) => {
                this.options = elements;
              },
              (error) => {
                console.log(error);
                this.error = true;
              },
              () => {
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

                this.afterLoadRelated(this.related);
              }
            );
        },
        (error) => {
          console.log(error);
          this.error = true;
        });

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
      .getArchivalResourcesMatchingNames(this.currentMunicipalityVersion, related)
      .subscribe(
        (elements: any[]) => this.archivalResources = elements,
        (error) => {
          console.log(error);
          this.error = true;
        },
        () => {
          this.configObject = {settings: this.settings, fields: this.fields, data: this.archivalResources};
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
        if(r.name != this.active.name){
          if (!r.state && w.name != r.name && w.admissionMutation.id == r.abolitionMutation.id) {
            if(!history.find(x => x.id == r.id)){
              history.push({
                'name': r.name,
                'id': r.id,
                'date': r.abolitionMutation.date,
                'mutation': w.admissionMutation.mutationLabel
              });
            }
          }
          if (!w.state && w.name != r.name && w.abolitionMutation.id == r.admissionMutation.id) {
            if(!history.find(x => x.id == r.id)){
              history.push({
                'name': r.name,
                'id': r.id,
                'date': r.admissionMutation.date,
                'mutation': r.admissionMutation.mutationLabel
              });
            }
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

  private getRelatedVersions(current: MunicipalityVersion): MunicipalityVersion[] {
    let versionsWithSameMunicipality: MunicipalityVersion[] = [];

    for (const option of this.options) {
      if (current.municipality == option.municipality) {
        versionsWithSameMunicipality.push(option);
      }
    }

    let related: MunicipalityVersion[] = [];

    for (const version of versionsWithSameMunicipality) {
      for (const option of this.options) {
        if (version.abolitionMutation) {
          if (related.indexOf(option) == -1) {
            if (version.abolitionMutation.id == option.admissionMutation.id) {
              related.push(option);
            }
          }
        }
        if (option.abolitionMutation) {
          if (related.indexOf(option) == -1) {
            if (version.admissionMutation.id == option.abolitionMutation.id) {
              related.push(option);
            }
          }
        }
      }
    }
    return related;
  }

  private getActive(currentVersion: MunicipalityVersion): MunicipalityVersion {
    let relatedVersions: MunicipalityVersion[];

    //Test if current is an active version
    if(currentVersion.state){
      return currentVersion;
    }

    //Get related versions of current
    relatedVersions = this.getRelatedVersions(currentVersion);

    //Search active version in related
    for (let version of relatedVersions) {
      if (version.state) {
        return version;
      }
    }

    //Launch get active with most recent related version
    return this.getActive(this.getMostRecentVersion(relatedVersions));
  }

  private getMostRecentVersion(versions: MunicipalityVersion[]): MunicipalityVersion{
    if(versions.length < 1){
      return versions[0];
    }

    //Sort the table, first element is most recent
    versions.sort((a: any, b: any) => {
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

    return versions[0];
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
      objectKey:'title',
      sort:'enable',
      columnOrder:2,
      search: true
    },{
      objectKey:'startDate',
      sort:'enable',
      columnOrder:3,
      search: false
    },{
      objectKey: 'endDate',
      sort: 'enable',
      columnOrder: 4,
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
      name:'Début',
      objectKey:'startDate',
      classNames: 'sort-numeric',
      value: function(row){
        if(row.startDate){
          return row.startDate;
        }
        return '';
      }
    },{
      name:'Fin',
      objectKey:'endDate',
      classNames: 'sort-numeric',
      value: function(row){
        if(row.endDate){
          return row.endDate;
        }
        return '';
      }
    },{
      objectKey: 'swissArchiveButton',
      name: '',
      value: () => '',
      render: () => ' <a class="btn btn-primary"> Swiss Archive </button>',
      click: (row) => window.open(swissArchiveURL+row.id, "_blank")
    }];
  }

  private onChangeFilter(startDate, endDate, historyName){
    console.log(startDate + " " + endDate + " " + historyName);

    let filters: IFilters = {};

    this.invalidPeriod = false;

    if(historyName == 'Sélectionner un nom'){
      historyName = '';
    }

    if(startDate != 'Début' && endDate != 'Fin' && startDate > endDate) {
      this.invalidPeriod = true;
    }
    else{
      if(startDate != 'Début'){
        let startYears: number[] = [];

        for(let year of this.startPeriodFilter){
          if(year >= startDate){
            startYears.push(year);
          }
        }
        filters.startDate = startYears;
      }
      if(endDate != 'Fin'){
        let endYears: number[] = [];

        for(let year of this.endPeriodFilter){
          if(year <= endDate){
            endYears.push(year);
          }
        }
        filters.endDate = endYears;
      }
    }

    console.log(filters);

    this.archivalResourcesTable.gtApplyFilter(filters);
    this.archivalResourcesTable.gtSearch(historyName);
  }
}
