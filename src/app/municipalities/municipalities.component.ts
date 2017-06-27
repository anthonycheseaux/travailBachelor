import {Component, OnInit, ViewChild} from '@angular/core';
import {MunicipalitiesService} from "./municipalities.service";
import {Municipality} from "./municipality";
import {GtConfig, GenericTableComponent} from "@angular-generic-table/core";
import {Router} from "@angular/router";
import {CustomRowComponent} from "../custom-row/custom-row.component";

@Component({
  selector: 'app-municipalities',
  templateUrl: './municipalities.component.html',
  styleUrls: ['./municipalities.component.css']
})
export class MunicipalitiesComponent implements OnInit {

  cantons = [
    {code: 'VD', name: 'Vaud'},
    {code: 'FR', name: 'Fribourg'},
    {code: 'VS', name: 'Valais'},
    {code: 'BE', name: 'Berne'}
  ];

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
        render: () => ' <button md-raised-button"> Voir les UD </button>',
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
  }

  private updateAfterLoad(){
    this.configObject = {settings: this.settings, fields: this.fields, data: this.options};

    this.loading = false;
  }

  @ViewChild(GenericTableComponent)
  private municipalityTable: GenericTableComponent<any, CustomRowComponent>;

  onChange(cantonName){
    if(cantonName == "Tous les cantons") {
      this.municipalityTable.gtApplyFilter({});
    }
    else {
      this.municipalityTable.gtApplyFilter({canton: cantonName});
    }
  }
}
