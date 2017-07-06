import {Component, OnInit, ViewChild} from '@angular/core';
import {MunicipalitiesService} from "./municipalities.service";
import {Municipality} from "../objects/municipality";
import {GtConfig, GenericTableComponent} from "@angular-generic-table/core";
import {Router} from "@angular/router";
import {CustomRowComponent} from "../custom-row/custom-row.component";
import {Canton} from "../objects/canton";
import {District} from "../objects/district";
import {MunicipalityVersion} from "../objects/municipality-version";
import {assertNotNull} from "@angular/compiler/src/output/output_ast";

interface IFilters{
  canton?:string;
  district?:string;
  state?:string;
}

@Component({
  selector: 'app-municipalities',
  templateUrl: './municipalities.component.html',
  styleUrls: ['./municipalities.component.css']
})
export class MunicipalitiesComponent implements OnInit {

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

    constructor(private router: Router, private municipalitiesService: MunicipalitiesService) {
      this.settings = [{
        objectKey:'id',
        sort:'disable',
        visible:false,
        columnOrder:0,
        search: false
      },{
        objectKey:'name',
        sort:'enable',
        columnOrder:1,
        search: true
      },{
        objectKey:'district',
        sort:'enable',
        columnOrder:2,
        search: false
      },{
        objectKey:'canton',
        sort:'enable',
        columnOrder:3,
        search: false
      },{
        objectKey: 'abolitionDate',
        sort: 'disable',
        visible: true,
        columnOrder: 4,
        search: false
      },{
        objectKey: 'abolitionLabel',
        sort: 'disable',
        visible: true,
        columnOrder: 5,
        search: false
      },{
        objectKey: 'UDButton',
        columnOrder: 6,
        sort: 'disable',
        search: false
      },{
        objectKey: 'state',
        sort:'enable',
        visible: false,
        columnOrder: 7,
        search: false
      }];

      this.fields = [{
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
        value: function(row){return row.abolitionMutation.date}
      },{
        name:'Motif',
        objectKey:'abolitionLabel',
        classNames: 'sort-string',
        value: function(row){return row.abolitionMutation.mutationLabel}
      },{
        objectKey: 'UDButton', name: '',
        value: () => '',
        render: () => ' <a class="btn btn-primary"> Voir les UD </button>',
        click: (row) => this.router.navigate(['/municipalities/', row.id, 'archival-resources'])
      }];
    }

  ngOnInit() {
    this.loading = true;

    this.municipalitiesService.getAllMunicipalities().subscribe(
      (elements: any[]) => this.options = elements,
      (error) => console.log(error),
      () => this.updateAfterLoad()
    );

    this.municipalitiesService.getCantonsDistricts().subscribe(
      (elements: any[]) => this.cantons = elements,
      (error) => console.log(error)
    );
  }

  private updateAfterLoad(){
    this.configObject = {settings: this.settings, fields: this.fields, data: this.options};

    this.loading = false;
  }

  @ViewChild(GenericTableComponent)
  private municipalitiesTable: GenericTableComponent<any, CustomRowComponent>;

  onChangeFilter(cantonName:string, districtName: string, state: string){
    console.log(cantonName + " " + districtName + " " + state);
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
    else

    if(state != "Tous les statuts"){
      filters.state = state;
    }

    this.municipalitiesTable.gtApplyFilter(filters);
  }

  onChangeCanton(cantonName: string){
    if(cantonName == "Tous les cantons") {
      this.districts = [];
      this.disableDistricts = true;
      this.municipalitiesTable.gtApplyFilter({});
    }
    else {
      let current: Canton = this.cantons.find(x => x.name == cantonName);
      this.districts = current.districts;
      this.disableDistricts = false;
      this.municipalitiesTable.gtApplyFilter({canton: cantonName});
    }
  }

  onChangeDistrict(districtName: string, cantonName: string){
    if(districtName == "Tous les districts") {
      this.municipalitiesTable.gtApplyFilter({});
    }
    else {
      this.municipalitiesTable.gtApplyFilter({canton: cantonName,district: districtName});
    }
  }

  onChangeState(state: string){
    if(state == "Tous les statuts") {
      this.municipalitiesTable.gtApplyFilter({});
    }
    else {
      this.municipalitiesTable.gtApplyFilter({state: state});
    }
  }

/*  isActiveCheck: boolean = false;

  activeCheck(){
    this.municipalitiesTable.gtApplyFilter({active: this.isActiveCheck.toString().toLowerCase()})
  }*/
}
