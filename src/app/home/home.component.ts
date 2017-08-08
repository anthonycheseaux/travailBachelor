import {Component, OnInit, OnDestroy} from '@angular/core';
import {MunicipalitiesService} from "../municipalities/municipalities.service";
import {Router} from "@angular/router";
import {MunicipalityVersion} from "../objects/municipality-version";
import {Subscription} from "rxjs";

/**
 * Component use to manage home page (link to municipalities versions)
 */
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {

  //Array of all municipalities versions and distinct ones
  municipalities: MunicipalityVersion[] = [];
  distinctMunicipalities: MunicipalityVersion[] = [];

  //empty municipality version for auto complete
  currentMunicipality: MunicipalityVersion;
  //array for matching municipalities versions names in auto complete
  tdMunicipalities: any[];

  //Error management
  invalidName: boolean = false;
  message: string = 'Erreur';
  error: boolean;

  //Subscriptions to get all municipalities versions
  getAllMunicipalitiesSubscription: Subscription;

  /**
   *  Constructor of the component
   * @param router Router DI to managing the routing
   * @param municipalitiesService Service DI to manage get the data
   */
  constructor(private router: Router, private municipalitiesService: MunicipalitiesService) {
    //Attribute instanciation
    this.currentMunicipality = new MunicipalityVersion(null, null, '', null, false, null, null, null, null);
    this.error = false;
  }

  /**
   * Initialization of the component, happen after the constructor
   */
  ngOnInit() {
    //Load of the all the municipalities versions by the service method subscription
    this.getAllMunicipalitiesSubscription = this.municipalitiesService.getAllMunicipalities()
      .subscribe(
        //Method return array store in component attribute
        (elements: any[]) => this.municipalities = elements,

        //If an error happened, log in the console and information in the UI
        (error) => {
          console.log(error);
          this.error = true;
        },

        //On complete
        ()=> {
          this.distinctMunicipalities = this.municipalitiesService.getDistinctMunicipalities(this.municipalities);
          this.tdMunicipalities = this.distinctMunicipalities;
        }
      );
  }

  /**
   * Manage destroy phase in lifecycle
   */
  ngOnDestroy() {
    //Destruction of subscriptions
    if(this.getAllMunicipalitiesSubscription)
      this.getAllMunicipalitiesSubscription.unsubscribe();
  }

  /**
   * Match string entry to existing names in distinct array
   * @param value String The value the user enter in field
   * @returns {MunicipalityVersion[]} the matching municipalities versions
   */
  filterMunicipalities(value: string) {
    return value ? this.distinctMunicipalities.filter(s => new RegExp(`^${value}`, 'gi').test(s.name))
      : this.distinctMunicipalities;
  }

  /**
   * Method that redirect user to the selected municipality version
   * Manage name error
   * @param current String Municipality version name
   */
  onClick(current: string) {
    //Check if name exists
    for(let m of this.distinctMunicipalities){
      if(m.name.toUpperCase() == current.trim().toUpperCase()) {
        //redirection if name ok
        this.router.navigate(['/municipalities/', m.id, 'archival-resources']);
      }
    }
    this.invalidName = true;
    this.message = 'Cette commune n\'existe pas';
  }
}
