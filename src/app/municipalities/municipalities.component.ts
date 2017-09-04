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
 * Component used to manage the municipalities
 */
@Component({
  selector: 'app-municipalities',
  templateUrl: './municipalities.component.html',
  styleUrls: ['./municipalities.component.css']
})
export class MunicipalitiesComponent implements OnInit, OnDestroy {

  /**
   * Attributes
   */
      //Table to display the municipalities versions
      @ViewChild(GenericTableComponent)
      private municipalitiesTable: GenericTableComponent<any, CustomRowComponent>;

      //State string for drop down list
      states: string[] = ["Actif", "Inactif"];

      //Arrays for the cantons and districts display in filters
      cantons: Canton[] = [];
      districts: District[] = [];

      //Boolean to enable or disable the district filters usage
      disableDistricts = true;

      //Array for all municipalities versions
      allMunicipalitiyVersions: MunicipalityVersion[] = [];

      //Boolean used to enable and disable the loading UI
      //true = loading UI is display ; false = loading display is hidden
      loading: boolean;

      //Array for municipality versions to display in the table
      distinctMunicipalities: MunicipalityVersion[] = [];

      //Objects needed to configure the table
      configObject: GtConfig<any>;
      settings = [];
      fields = [];

      //Subscriptions object to manage observable
      getAllMunicipalitiesSubscription: Subscription;
      getCantonDistrictSubscription: Subscription;

      //Boolean used to display the error message in UI
      error: boolean;

  /**
   *
   * @param router DI used for the routing, redirection to another defined route in app
   * @param municipalitiesService DI used to get data from HTTP requests
   */
  constructor(private router: Router, private municipalitiesService: MunicipalitiesService) {
    //loading of the component start here
    this.loading = true;

    //initialisation of the settings and the options of the table managed in dedicated methods
    this.settings = this.constructListSettings();
    this.fields = this.constructListFields();

    //initialisation to no error
    this.error = false;
  }

  /**
   * Initialisation of the component that happen after the constructor method
   */
  ngOnInit() {
    //Load of the all the municipalities versions by the service method subscription
    this.getAllMunicipalitiesSubscription =
      this.municipalitiesService.getAllMunicipalities().subscribe(
        //Method return array store in component attribute
        (elements: any[]) => this.allMunicipalitiyVersions = elements,

        //If an error happened, log in the console and information in the UI
        (error) => {
          console.log(error);
          this.error = true;
        },

        //On complete
        () => {
          //Get the distinct municipalities for the displaying in the table
          this.distinctMunicipalities = this.municipalitiesService.getDistinctMunicipalities(this.allMunicipalitiyVersions);

          //Parameters pass to the table
          this.configObject = {settings: this.settings, fields: this.fields, data: this.distinctMunicipalities};

          //Get cantons and districts from the service
          this.getCantonDistrictSubscription =
            this.municipalitiesService.getCantonsDistricts().subscribe(
              //Result in component object
              (elements: any[]) => this.cantons = elements,

              //On error management
              (error) => {
                console.log(error);
                //Information in UI
                this.error = true;
              },

              //On complete, hide load UI, display real content
              () => {
                this.loading = false;
              }
            );
        }
      );
  }

  /**
   * Manage destroy phase in lifecycle
   */
  ngOnDestroy() {

    //Destruction of the subscription if they are instantiate
    if(this.getAllMunicipalitiesSubscription)
      this.getAllMunicipalitiesSubscription.unsubscribe();

    if(this.getCantonDistrictSubscription)
      this.getCantonDistrictSubscription.unsubscribe();
  }

  /**
   * @returns Object use to specify the settings of the table
   */
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
      sort: 'enable',
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

  /**
   * @returns Object use to specify the displaying settings and behavior of the elements of the table
   */
  private constructListFields(): any[]{
    return [{
      name:'Statut',
      objectKey:'state',
      classNames: 'text-xs-left',
      render: function(row){
        let color: string;
        if(row.state){
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

  /**
   * Method used by the filterForm elements to filter the elements in the table
   * @param cantonName String Name from drop down list
   * @param districtName String Name from drop down list
   * @param state String used to know if active or inactive municipalities to display
   */
  onChangeFilter(cantonName:string, districtName: string, state: string){
    //Object use to send all the filters to apply on the table
    let filters: IFilters = {};

    //If initial state empty and disable district selection
    if(cantonName == "Tous les cantons"){
      this.districts = [];
      this.disableDistricts = true;
    }
    //Any other selection
    else {
      //Find selected canton
      let current: Canton = this.cantons.find(x => x.name == cantonName);

      //Fill districts to display
      this.districts = current.districts;

      //Allow district selection
      this.disableDistricts = false;

      //Fill filters object with selected canton
      filters.canton = cantonName;
    }

    //If not in initial state
    if(districtName != "Tous les districts"){

      //Fill filters object with selected district
      filters.district = districtName;
    }

    /**
     * If initial state, do nothing
     * If active convert to true
     * If inactive convert to false
     */
    switch(state){
      case 'Tous les statuts' : {
        break;
      }
      case 'Actif' : {
        filters.state = 'true';
        break;
      }
      case 'Inactif' : {
        filters.state = 'false';
        break;
      }
    }

    //Apply the filter using the library method of the table
    this.municipalitiesTable.gtApplyFilter(filters);
  }
}

/**
 * Interface used to manage filters on applied on the list
 * Parameters are all optionals
 */
interface IFilters{
  canton?:string;
  district?:string;
  state?:string;
}
