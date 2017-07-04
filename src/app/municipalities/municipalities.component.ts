import {Component, OnInit, ViewChild} from '@angular/core';
import {MunicipalitiesService} from "./municipalities.service";
import {Municipality} from "./municipality";
import {GtConfig, GenericTableComponent} from "@angular-generic-table/core";
import {Router} from "@angular/router";
import {CustomRowComponent} from "../custom-row/custom-row.component";
import {Canton} from "./canton";
import {District} from "./district";

@Component({
  selector: 'app-municipalities',
  templateUrl: './municipalities.component.html',
  styleUrls: ['./municipalities.component.css']
})
export class MunicipalitiesComponent implements OnInit {

  cantons: Canton[] = [];
  districts: District[] = [];
  disableDistricts = true;

  options: Municipality[] = [];
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
        columnOrder:0
      },{
        objectKey:'name',
        sort:'enable',
        columnOrder:1
      },{
        objectKey:'district',
        sort:'enable',
        columnOrder:2
      },{
        objectKey:'canton',
        sort:'enable',
        columnOrder:3
      },{
        objectKey: 'UDButton',
        columnOrder: 4,
        sort: 'disable'
      },{
        objectKey: 'active',
        sort:'enable',
        visible: false,
        columnOrder: 5
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

  isActiveCheck: boolean = false;

  activeCheck(){
    this.municipalitiesTable.gtApplyFilter({active: this.isActiveCheck.toString().toLowerCase()})
  }
}
