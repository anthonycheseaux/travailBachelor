import {Component, OnInit, ViewChild, OnDestroy} from '@angular/core';
import {MunicipalitiesService} from "./municipalities.service";
import {GtConfig, GenericTableComponent} from "@angular-generic-table/core";
import {Router} from "@angular/router";
import {CustomRowComponent} from "../custom-row/custom-row.component";
import {Canton} from "../objects/canton";
import {District} from "../objects/district";
import {MunicipalityVersion} from "../objects/municipality-version";
import {Subscription} from "rxjs";

/**
 * Interface used to manage filters on applied on the list
 */
interface IFilters{
  canton?:string;
  district?:string;
  state?:string;
}

/**
 * Component used to manage the municipalities
 */
@Component({
  selector: 'app-municipalities',
  templateUrl: './municipalities.component.html',
  styleUrls: ['./municipalities.component.css']
})
export class MunicipalitiesComponent implements OnInit, OnDestroy {

  @ViewChild(GenericTableComponent)
  private municipalitiesTable: GenericTableComponent<any, CustomRowComponent>;

  states: string[] = ["Actif", "Inactif"];
  cantons: Canton[] = [];
  districts: District[] = [];
  disableDistricts = true;

  options: MunicipalityVersion[] = [];
  loading: boolean;
  municipalityNb: number = 0;

  configObject: GtConfig<any>;
  settings = [];
  fields = [];

  //Subscriptions
  getAllMunicipalitiesSubscription: Subscription;
  getCantonDistrictSubscription: Subscription;

  constructor(private router: Router, private municipalitiesService: MunicipalitiesService) {
    this.loading = true;
    this.settings = this.constructListSettings();
    this.fields = this.constructListFields();
  }

  ngOnInit() {
    this.getAllMunicipalitiesSubscription =
      this.municipalitiesService.getAllMunicipalities().subscribe(
      (elements: any[]) => this.options = elements,
      (error) => console.log(error),
      () => {
        this.configObject = {settings: this.settings, fields: this.fields, data: this.options};
        this.loading = false;
      }
    );

    this.getCantonDistrictSubscription =
      this.municipalitiesService.getCantonsDistricts().subscribe(
        (elements: any[]) => this.cantons = elements,
        (error) => console.log(error)
      );
  }

  ngOnDestroy() {
    this.getAllMunicipalitiesSubscription.unsubscribe();
    this.getCantonDistrictSubscription.unsubscribe();
  }

  private constructListSettings(): any[]{
    return [{
      objectKey:'id',
      sort:'disable',
      visible:false,
      columnOrder:0,
      search: false
    },{
      objectKey: 'state',
      sort:'disable',
      visible: true,
      columnOrder: 1,
      search: false
    },{
      objectKey:'name',
      sort:'asc',
      columnOrder:2,
      search: true
    },{
      objectKey:'district',
      sort:'enable',
      columnOrder:3,
      search: false
    },{
      objectKey:'canton',
      sort:'enable',
      columnOrder:4,
      search: false
    },{
      objectKey: 'abolitionDate',
      sort: 'disable',
      visible: true,
      columnOrder: 5,
      search: false
    },{
      objectKey: 'abolitionLabel',
      sort: 'disable',
      visible: true,
      columnOrder: 6,
      search: false
    },{
      objectKey: 'UDButton',
      columnOrder: 7,
      sort: 'disable',
      search: false
    }];
  }

  private constructListFields(): any[]{
    return [{
      name:'Statut',
      objectKey:'state',
      classNames: 'text-xs-left',
      render: function(row){
        let color: string;
        if(row.state == 'Actif'){
          color = '#80dc18';
        }else{
          color = '#dc4351';
        }

        return '<div style="float:left;width:15px;height:15px;border-radius:50%;background: ' + color + '"></div>';
      }
    },{
      name:'Nom',
      objectKey:'name',
      classNames: 'sort-string'
    },{
      name:'District',
      objectKey:'district',
      classNames: 'sort-string'
    },{
      name:'Canton',
      objectKey:'canton',
      classNames: 'sort-string'
    },{
      name:'Radiée le',
      objectKey:'abolitionDate',
      classNames: 'sort-string',
      value: function(row){
        if(row.abolitionMutation){
          return row.abolitionMutation.date;
        }
        return '';
      }
    },{
      name:'Motif',
      objectKey:'abolitionLabel',
      classNames: 'sort-string',
      value: function(row){
        if(row.abolitionMutation) {
          return row.abolitionMutation.mutationLabel
        }
        return '';
      }
    },{
      objectKey: 'UDButton', name: '',
      value: () => '',
      render: () => '<a class="btn btn-primary" style="width: 30px;height: 30px;text-align: center;padding: 6px 0;font-size: 12px;line-height: 1.42;border-radius: 15px;"><span class="glyphicon glyphicon-chevron-right"></span></a>',
      click: (row) => this.router.navigate(['/municipalities/', row.id, 'archival-resources'])
    }];
  }

  onChangeFilter(cantonName:string, districtName: string, state: string){
    let filters: IFilters = {};

    if(cantonName == "Tous les cantons"){
      this.districts = [];
      this.disableDistricts = true;
    }
    else {
      let current: Canton = this.cantons.find(x => x.name == cantonName);
      this.districts = current.districts;
      this.disableDistricts = false;
      filters.canton = cantonName;
    }

    if(districtName != "Tous les districts"){
      filters.district = districtName;
    }

    if(state != "Tous les statuts"){
      filters.state = state;
    }

    this.municipalitiesTable.gtApplyFilter(filters);
  }
}
