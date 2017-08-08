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

//URL for the Swiss archive app, add archival resource id
const swissArchiveURL: string = 'https://www.swiss-archives.ch/detail.aspx?id=';
const mapURL: string = '//map.geo.admin.ch/?ch.swisstopo.swissboundaries3d-gemeinde-flaeche.fill=';

/**
 * Component used to manage archival resources
 */
@Component({
  selector: 'app-archival-resources',
  templateUrl: './archival-resources.component.html',
  styleUrls: ['./archival-resources.component.css'],
  providers: [ArchivalResourcesService]
})
export class ArchivalResourcesComponent implements OnInit, OnDestroy {

  //Table
  @ViewChild(GenericTableComponent)
  private archivalResourcesTable: GenericTableComponent<any, CustomRowComponent>;

  //Loading managing
  loading: boolean;

  //all municipalities
  municipalities: MunicipalityVersion[];

  //current municipality version
  versionId: number;
  currentMunicipalityVersion: MunicipalityVersion;

  //related archival resources
  archivalResources: ArchivalResources[];

  //Period filters
  startPeriod: number[];
  startPeriodFilter: number[];
  endPeriod: number[];
  endPeriodFilter: number[];
  invalidPeriod: boolean;
  invalidPeriodMessage: string;

  //History
  history: any[];
  historyCheckBoxField: string[];
  related: MunicipalityVersion[];
  active: MunicipalityVersion;

  //Map
  mapActive: boolean = false;
  mapUrl: string;

  //List
  configObject: GtConfig<any>;
  settings = [];
  fields = [];

  //Subscriptions
  getAllMunicipalitiesSubscription: Subscription;
  getArchivalResourcesMatchingNamesSubscription: Subscription;
  routeSubscription: Subscription;

  //error display management
  error: boolean;

  /**
   * Constructor
   * @param sanitizer to secure SwissArchive URL
   * @param route DI to manage query string
   * @param router DI to manage routing
   * @param archivalResourcesService DI to manage data archival resources
   * @param municipalitiesService DI to manage data municipalities
   */
  constructor(public sanitizer: DomSanitizer,
              private route: ActivatedRoute,
              private router: Router,
              private archivalResourcesService: ArchivalResourcesService,
              private municipalitiesService: MunicipalitiesService) {

    //Initializations
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

    //get the current year
    let currentYear: number = new Date().getFullYear();

    //Fill tab with current years from 1000 to now
    for(let i=1000; i<currentYear; i++){
      this.startPeriodFilter.push(i);
      this.endPeriodFilter.push(i);
    }

    for(let i=1848; i<currentYear; i+=10){
      this.startPeriod.push(i);
      this.endPeriod.push(i);
    }
  }

  /**
   * Initialisation of the component that happen after the constructor method
   */
  ngOnInit() {
    this.loading = true;

    //Load of the municipality id using the route method subscription
    this.routeSubscription =
      this.route.params.subscribe(
        //Get the id in query string
        (params: Params) => this.versionId = params['id'],

        //If error happend
        (error) => {
          console.log(error);
          this.error = true;
        },

        //on complete
        () => {
          this.getAllMunicipalitiesSubscription =
            this.municipalitiesService.getAllMunicipalities().subscribe(
              (elements: any[]) => {
                this.municipalities = elements;
              },
              (error) => {
                console.log(error);
                this.error = true;
              },
              () => {
                this.currentMunicipalityVersion = this.municipalities.find(x => x.id == this.versionId);

                this.related = this.getRelatedVersions(this.currentMunicipalityVersion);

                this.active = this.getActive(this.currentMunicipalityVersion);
                //Active Municipality for the map
                this.mapUrl = this.mapUrl + this.active.municipality;
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
        })
  }

  ngOnDestroy() {
    //destroy subscriptions
    if(this.getAllMunicipalitiesSubscription)
      this.getAllMunicipalitiesSubscription.unsubscribe();
    if(this.routeSubscription)
      this.routeSubscription.unsubscribe();
    if(this.getArchivalResourcesMatchingNamesSubscription)
      this.getArchivalResourcesMatchingNamesSubscription.unsubscribe();
  }

  /**
   *
   * @param related
   */
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

  /**
   *
   * @param related
   * @returns {any[]}
   */
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

  /**
   *
   * @param current
   * @returns {MunicipalityVersion[]}
   */
  private getRelatedVersions(current: MunicipalityVersion): MunicipalityVersion[] {
    let versionsWithSameMunicipality: MunicipalityVersion[] = [];

    for (const municipality of this.municipalities) {
      if (current.municipality == municipality.municipality) {
        versionsWithSameMunicipality.push(municipality);
      }
    }

    let related: MunicipalityVersion[] = [];

    for (const version of versionsWithSameMunicipality) {
      for (const municipality of this.municipalities) {
        if (version.abolitionMutation) {
          if (related.indexOf(municipality) == -1) {
            if (version.abolitionMutation.id == municipality.admissionMutation.id) {
              related.push(municipality);
            }
          }
        }
        if (municipality.abolitionMutation) {
          if (related.indexOf(municipality) == -1) {
            if (version.admissionMutation.id == municipality.abolitionMutation.id) {
              related.push(municipality);
            }
          }
        }
      }
    }
    return related;
  }

  /**
   *
   * @param currentVersion
   * @returns {MunicipalityVersion}
   */
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

  /**
   *
   * @param versions
   * @returns {MunicipalityVersion}
   */
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

  /**
   *
   * @returns {[{objectKey: string, sort: string, visible: boolean, columnOrder: number, search: boolean},{objectKey: string, sort: string, columnOrder: number, search: boolean},{objectKey: string, sort: string, columnOrder: number, search: boolean},{objectKey: string, sort: string, columnOrder: number, search: boolean},{objectKey: string, sort: string, columnOrder: number, search: boolean},{objectKey: string, columnOrder: number, sort: string, search: boolean}]}
   */
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

  /**
   *
   * @returns {[{name: string, objectKey: string, classNames: string},{name: string, objectKey: string, classNames: string},{name: string, objectKey: string, classNames: string, value: ((row:any)=>(number[]|number|string))},{name: string, objectKey: string, classNames: string, value: ((row:any)=>(number[]|number|string))},{objectKey: string, name: string, value: (()=>string), render: (()=>string), click: ((row:any)=>Window)}]}
   */
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

  /**
   * 
   * @param startDate
   * @param endDate
   * @param historyName
   */
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

/**
 * Interface used to manage filters on applied on the list
 */
interface IFilters{
  title?:string[];
  startDate?:number[];
  endDate?:number[];
}
