import { Injectable } from '@angular/core';
import { Headers, Http, Response } from '@angular/http'
import 'rxjs/Rx';
import {Canton} from "../objects/canton";
import {District} from "../objects/district";
import {MunicipalityVersion} from "../objects/municipality-version";
import {Mutation} from "../objects/mutation";
import {Observable} from "rxjs";

//URL of the endpoint use to send SPARQL queries to the triple store
const endpointUrl  = 'https://test.lindas-data.ch:8443/lindas/query?query=';

/**
 * Service class used to get and manage data related to the swiss versioned municipality repository data set
 */
@Injectable()
export class MunicipalitiesService {
  //Array that store the list of all municipalities versions
  private municipalities: MunicipalityVersion[];
  //Observable of the array above
  private municipalitiesObservable: Observable<any>;

  //Array that store all the cantons (they contain the districts)
  private cantons: Canton[];
  //Observable of the array above
  private cantonsObservable: Observable<any>;

  /**
   * Constructor of the service
   * @param http DI used to launch http request to the endpoint
   */
  constructor(private http: Http) {}

  /**
   * Method that build the header needed in the http requests
   * Accept part for the response format
   * Authorization part for the credentials
   * @returns {Headers} Object header to use in the request
   */
  private getHeaders(): Headers {
    let headers: Headers = new Headers();

    //Response format
    headers.append("accept", "application/sparql-results+json");

    //Credentials
    let username: string = 'public';
    let password: string = 'public';
    headers.append("authorization", "basic " + btoa(username + ":" + password));

    return headers;
  }

  /**
   * Method to get all the municipalities versions stored in the triple store
   * @returns {any} Observable of the municipalities array
   */
  getAllMunicipalities() {

    //if the array is already load
    if(this.municipalities){
      return Observable.of(this.municipalities);
    }
    //if the request is pending
    else if(this.municipalitiesObservable) {
      return this.municipalitiesObservable;
    }
    //All other case, send the request
    else {
      //SPARQL query
      let query:string =
        'PREFIX gont: <https://gont.ch/>' +
        'SELECT ?version ?id ?name ?municipalityId ?cantonName ?districtName ?adEvent ?adId ?adDate ?adLabel ?abEvent ?abId ?abDate ?abLabel ' +
        'FROM <https://linked.opendata.swiss/graph/eCH-0071> ' +
        'WHERE { ' +
        '?municipality a gont:PoliticalMunicipality; ' +
        'gont:id ?municipalityId. ' +
        '?version a gont:MunicipalityVersion; ' +
        'gont:municipality ?municipality ; ' +
        'gont:longName ?name; ' +
        'gont:id ?id; ' +
        'gont:canton ?canton; ' +
        'gont:district ?d; ' +
        'gont:admissionEvent ?adEvent; ' +
        'gont:admissionMode ?adMode. ' +
        '?canton gont:longName ?cantonName. ' +
        '?d gont:longName ?districtName. ' +
        '?adEvent gont:date ?adDate; ' +
        'gont:id ?adId. ' +
        '?adMode skos:notation ?adLabel. ' +
        'OPTIONAL{ ' +
        '?version gont:abolitionEvent ?abEvent; ' +
        'gont:abolitionMode ?abMode. ' +
        '?abEvent gont:date ?abDate; ' +
        'gont:id ?abId. ' +
        '?abMode skos:notation ?abLabel. ' +
        '} ' +
        '} ' +
        'ORDER BY ASC (?name) DESC (?adDate)';

      //Encode the request ans add to the endpoint query url
      let getUrl = endpointUrl+encodeURIComponent(query);

      //Send the request via HTTP protocol with the headers
      //store the shared result in the municipalitiesObservable attribute
      this.municipalitiesObservable = this.http.get(getUrl, {headers: this.getHeaders()})
        .map(
          (response: Response) => {
            //before to fill it, empty the variable
            this.municipalitiesObservable = null;

            //Parse the response in JSON
            //Get the results array
            let data = response.json().results.bindings;

            //Instantiation of the result array
            let elements: MunicipalityVersion[] = [];

            //Temporary object used to ease the instantiation of the MunicipalityVersion objects
            let abolitionMutation: Mutation;
            let state: boolean = false;

            //Loop on the result array, where the values are
            for(const e of data){

              //If abolition information are available
              if(e.hasOwnProperty('abEvent')){
                state = false;
                abolitionMutation = new Mutation(
                  e.abId.value,
                  e.abEvent.value,
                  e.abDate.value,
                  +e.abLabel.value
                );
              }
              else {
                abolitionMutation = null;
                state = true;
              }

              //Add object instance to the response array
              elements.push(new MunicipalityVersion(
                e.id.value,
                e.version.value,
                e.name.value,
                e.municipalityId.value,
                state,
                e.cantonName.value,
                e.districtName.value,
                new Mutation(
                  e.adId.value,
                  e.adEvent.value,
                  e.adDate.value,
                  +e.adLabel.value
                ),
                abolitionMutation
              ));
            }

            //fill the dedicated attribute and return it
            this.municipalities = elements;
            return this.municipalities;
          }
        ).share();

      return this.municipalitiesObservable;
    }
  }

  /**
   * Method to get all cantons and districts stored in the triple store
   * @returns {any} Obervable of the canton array
   */
  getCantonsDistricts() {

    //if the array is already load
    if(this.cantons){
      return Observable.of(this.cantons);
    }
    //if the request is pending
    else if(this.cantonsObservable) {
      return this.cantonsObservable;
    }
    //All other case, send the request
    else {
      //SPARQL query
      let query: string =
        'PREFIX gont: <https://gont.ch/> ' +
        'PREFIX skos: <http://www.w3.org/2004/02/skos/core#> ' +
        'SELECT ?canton ?cantonId ?cantonName ?cantonAbbreviation ?cantonDate ' +
        '?district ?districtId ?districtName ?adModeLabel ?abModeLabel ?districtAbEvent ?abId ?abDate ' +
        'WHERE { ' +
        '?canton a gont:Canton; ' +
        'gont:id ?cantonId; ' +
        'gont:longName ?cantonName; ' +
        'gont:cantonAbbreviation ?cantonAbbreviation; ' +
        'gont:date ?cantonDate. ' +
        '?district a gont:DistrictEntityVersion; ' +
        'gont:canton ?canton; ' +
        'gont:id ?districtId; ' +
        'gont:longName ?districtName; ' +
        'gont:admissionMode ?districtAdMode. ' +
        '?districtAdMode skos:notation ?adModeLabel. ' +
        'OPTIONAL { ' +
        '?district gont:abolitionMode ?districtAbMode; ' +
        'gont:abolitionEvent ?districtAbEvent. ' +
        '?districtAbMode skos:notation ?abModeLabel. ' +
        '?districtAbEvent gont:date ?abDate; ' +
        'gont:id ?abId. ' +
        '} ' +
        '}' +
        'ORDER BY ?cantonName ?districtName';

      //Encode the query and add to the endpoint URL
      let getUrl = endpointUrl + encodeURIComponent(query);

      //Send the request via HTTP protocol with the headers
      //store the shared result in the cantonsObservable attribute
      this.cantonsObservable = this.http.get(getUrl, {headers: this.getHeaders()})
        .map(
          (response: Response) => {
            //Reset observable
            this.cantonsObservable = null;

            //Parse response to JSON and get the results data array
            let data = response.json().results.bindings;

            //Result array
            let elements: Canton[] = [];

            //Objects to help the building of the result array
            let currentDistricts: District[];
            let currentCanton: Canton;
            let currentDistrict: District;
            let districtAbMutation: Mutation;
            let cantonBefore: number = -1;

            //Loop on the data array
            for (const e of data) {

              //If inactive district
              if (e.hasOwnProperty('abModeLabel')) {
                districtAbMutation =
                  new Mutation(+e.abId.value, e.districtAbEvent.value, e.abDate.value, +e.abModeLabel.value);
              }
              else{
                districtAbMutation = null;
              }

              //Create new district
              currentDistrict = new District(
                +e.districtId.value,
                e.districtName.value,
                e.district.value,
                new Mutation(null, null, null, +e.adModeLabel.value),
                districtAbMutation
              );

              //Create new Canton when it change
              if (cantonBefore != +e.cantonId.value) {
                currentDistricts = [];

                currentCanton = new Canton(
                  +e.cantonId.value,
                  e.cantonAbbreviation.value,
                  e.cantonName.value,
                  e.canton.value,
                  e.cantonDate.value,
                  currentDistricts
                );

                //add new canton to result array
                elements.push(currentCanton);
              }

              //add district to his belonged canton
              currentCanton.districts.push(currentDistrict);

              cantonBefore = +e.cantonId.value;
            }

            //Remove duplicated district
            this.cantons = this.removeDuplicateDistrictName(elements);

            return this.cantons;
          }
        ).share();
      return this.cantonsObservable;
    }
  }

  /**
   * Method that purge canton array from duplicated district (based on names) keeping most recent versions
   * @param cantons Canton[] array to purge
   * @returns {Canton[]} purged array
   */
  private removeDuplicateDistrictName(cantons: Canton[]): Canton[]{
    //use of last district, base on the fact that it is sort
    let lastDistrict: District = new District(null, '', null, null, null);

    //array of District to remove
    let districtToRemove: District[] = [];

    //Loop on each canton
    for (const canton of cantons) {
      //Loop on each district
      for (const district of canton.districts) {
        //If same district than the one before need to remove one of them
        if (lastDistrict.name == district.name) {

          //district before is active, current is inactive
          //remove current
          if (lastDistrict.abolitionMutation == null && district.abolitionMutation != null) {
            districtToRemove.push(district);
          }

          //district before is inactive, current is active
          //remove district before
          else if(lastDistrict.abolitionMutation != null && district.abolitionMutation == null){
            districtToRemove.push(lastDistrict);
          }

          //District before is the most recent one
          //Remove current
          else if(lastDistrict.abolitionMutation.date > district.abolitionMutation.date){
            districtToRemove.push(district);
          }

          //Other cases remove district before
          else {
            districtToRemove.push(lastDistrict);
          }
        }

        //update district before
        lastDistrict = district;
      }

      //remove duplicated districts
      for (const i of districtToRemove) {
        canton.districts.splice(canton.districts.indexOf(i), 1);
      }

      //reset array
      districtToRemove = [];
    }

    return cantons;
  }

  /**
   * Method that purge all municipalities version array from duplicated version (based on names) keeping the most recent versions
   * @param allMunicipalities array to purge
   * @returns {MunicipalityVersion[]} distinct municipalities versions array
   */
  public getDistinctMunicipalities(allMunicipalities: MunicipalityVersion[]): MunicipalityVersion[]{
    //array of distinct municipalities
    let distinctMunicipalities: MunicipalityVersion[] = [];
    let similar: MunicipalityVersion = null;

    //loop on all versions
    for(let version of allMunicipalities){
      //find if exist a similar name in distinct array
      //if not add it
      if(!distinctMunicipalities.find(x => x.name == version.name)){
        distinctMunicipalities.push(version);
      } else {
        similar = distinctMunicipalities.find(x => x.name == version.name);

        //Keep the most recent one
        if(!similar.abolitionMutation || similar.abolitionMutation.date > version.abolitionMutation.date){
          //do nothing
        } else if(!version.abolitionMutation || version.abolitionMutation.date > similar.abolitionMutation.date){
          distinctMunicipalities[distinctMunicipalities.indexOf(similar)] = version;
        }
      }
    }

    return distinctMunicipalities;
  }

/*  /!**
   * @deprecated
   *!/
  getActiveMunicipalities() {

    let query:string =
      'PREFIX gont: <https://gont.ch/>' +
      'SELECT ?version ?id ?name ?municipalityId ?cantonName ?districtName ?adEvent ?adId ?adDate ?adLabel ' +
      'FROM <https://linked.opendata.swiss/graph/eCH-0071> ' +
      'WHERE { ' +
      '?municipality a gont:PoliticalMunicipality; ' +
      'gont:id ?municipalityId. ' +
      '?version a gont:MunicipalityVersion; ' +
      'gont:municipality ?municipality ; ' +
      'gont:longName ?name; ' +
      'gont:id ?id; ' +
      'gont:canton ?canton; ' +
      'gont:district ?d; ' +
      'gont:admissionEvent ?adEvent; ' +
      'gont:admissionMode ?adMode. ' +
      '?canton gont:longName ?cantonName. ' +
      '?d gont:longName ?districtName. ' +
      '?adEvent gont:date ?adDate; ' +
      'gont:id ?adId. ' +
      '?adMode skos:notation ?adLabel. ' +
      'MINUS{ ' +
      '?version gont:abolitionEvent ?abEvent. ' +
      '} ' +
      '} ' +
      'ORDER BY ASC (?name) DESC (?adDate)';

    let getUrl = endpointUrl+encodeURIComponent(query);

    return this.http.get(getUrl, {headers: MunicipalitiesService.getHeaders()})
      .map(
        (response: Response) => {
          let data = response.json().results.bindings;
          let elements: MunicipalityVersion[] = [];

          //console.log(data);

          let abolitionMutation: Mutation = new Mutation(null, null, null, -1);
          let admissionMutation: Mutation;

          for(const e of data){
            admissionMutation = new Mutation(
              e.adId.value,
              e.adEvent.value,
              e.adDate.value,
              +e.adLabel.value
            );

            elements.push(new MunicipalityVersion(
              e.id.value,
              e.version.value,
              e.name.value,
              e.municipalityId.value,
              true,
              e.cantonName.value,
              e.districtName.value,
              admissionMutation,
              abolitionMutation
            ));
          }

          //console.log(elements);
          return elements;
        }
      );
  }

  /!**
   * @deprecated
   *!/
  getHistory(uris: string){

    //SPARQL request
    let query:string =
      'SELECT ?version ?id ?name ?cantonName ?districtName ?adDate ?adLabel ?abDate ?abLabel ' +
      'FROM  <https://linked.opendata.swiss/graph/eCH-0071> ' +
      'WHERE { ' +
      'VALUES ?version {'+ uris +'} ' +
      '?version a gont:MunicipalityVersion; ' +
      'gont:id ?id; ' +
      'gont:longName ?name; ' +
      ' gont:canton ?c; ' +
      'gont:district ?d; ' +
      'gont:admissionEvent ?adEvent; ' +
      'gont:admissionMode ?adMode. ' +
      '?c gont:longName ?cantonName. ' +
      '?d gont:longName ?districtName. ' +
      '?adEvent gont:date ?adDate. ' +
      '?adMode skos:prefLabel ?adLabel. ' +
      'OPTIONAL{ ' +
      '?version gont:abolitionEvent ?abEvent; ' +
      'gont:abolitionMode ?abMode. ' +
      '?abEvent gont:date ?abDate. ' +
      '?abMode skos:prefLabel ?abLabel. ' +
      '} ' +
      '}';

    //encode the request and add it to the endpoint URL
    let getUrl = endpointUrl+encodeURIComponent(query);

    return this.http.get(getUrl, {headers: MunicipalitiesService.getHeaders()})
      .map(
        (response: Response) => {
          let data = response.json().results.bindings;
          let elements: MunicipalityVersion[] = [];

          console.log(data);

          for (const e of data) {

          }

          return elements;
        }
      );
  }

  /!**
   * @deprecated
   *!/
  getRelatedMunicipalities(id: number){
    let query:string = 'SELECT distinct ?otherVersion ?otherVersionLabel ' +
      'FROM  <https://linked.opendata.swiss/graph/eCH-0071> ' +
      'WHERE { ' +
      '?currentVersion a gont:MunicipalityVersion; ' +
      'gont:id '+ id +' . ' +
      '?municipality a gont:PoliticalMunicipality; ' +
      'gont:municipalityVersion ?currentVersion; ' +
      'gont:municipalityVersion ?version. ' +
      '{ ' +
      '?version gont:admissionEvent ?versionAdmissionEvent. ' +
      '?version gont:admissionMode ?versionAdmissionMode. ' +
      '?otherVersion a gont:MunicipalityVersion; ' +
      'gont:abolitionEvent ?versionAdmissionEvent; ' +
      'gont:longName ?otherVersionLabel. ' +
      '} ' +
      'UNION ' +
      '{ ' +
      '?version gont:abolitionEvent ?versionAbolitionEvent. ' +
      '?version gont:abolitionMode ?versionAbolitionMode. ' +
      '?otherVersion a gont:MunicipalityVersion; ' +
      'gont:admissionEvent ?versionAbolitionEvent; ' +
      'gont:longName ?otherVersionLabel. ' +
      '} ' +
      '}';

    let getUrl = endpointUrl+encodeURIComponent(query);

    return this.http.get(getUrl, {headers: MunicipalitiesService.getHeaders()})
      .map(
        (response: Response) => {
          let data = response.json().results.bindings;
          let elements = [];

          for (const e of data) {
            elements.push({'uri': e.otherVersion.value, 'name': e.otherVersionLabel.value});
          }

          return elements;
        }
      );
  }*/
}
