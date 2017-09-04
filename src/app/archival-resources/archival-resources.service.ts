import {Injectable} from "@angular/core";
import {Headers, Http, Response} from "@angular/http";
import {ArchivalResources} from "../objects/archival-resources";
import {MunicipalityVersion} from "../objects/municipality-version";

//URL of the endpoint use to send SPARQL queries to the triple store
const endpointUrl  = 'https://lindas-data.ch:8443/alod/query?query=';

/**
 * Service class used to get and manage data related to the archival resources data set
 */
@Injectable()
export class ArchivalResourcesService {

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
  private getHeaders(){
    let headers: Headers = new Headers();

    //Credentials
    let username: string = 'public';
    let password: string = 'public';

    //Response format
    headers.append("accept", "application/sparql-results+json");
    headers.append("authorization", "basic " + btoa(username + ":" + password));

    return headers;
  }

  /**
   * Method to get all archival resources matching municipalities name base on their presence in the title
   *
   * @param version Main municipality version to search
   * @param related Municipality versions related to the main one
   * @returns {Observable<R>} of the archival resources array
   */
  getArchivalResourcesMatchingNames(version: MunicipalityVersion, related: MunicipalityVersion[]){

    //get the names string to use in the sparql query
    let names: string = this.constructNamesString(version, related);

    //SPARQL query
    let query:string = 'PREFIX dcterms: <http://purl.org/dc/terms/> ' +
      'PREFIX alod: <http://data.admin.ch/alod/> ' +
      'PREFIX ukArch: <http://data.archiveshub.ac.uk/def/> ' +
      'SELECT DISTINCT ?archivalResource ?id ?title ?signature ?startDate ?endDate ' +
      'WHERE { ' +
      'GRAPH <http://data.alod.ch/graph/bar>{ ' +
      '?archivalResource a <http://data.archiveshub.ac.uk/def/ArchivalResource>.} ' +
      '?archivalResource dcterms:title ?title; ' +
      'alod:referenceCode ?signature; ' +
      'alod:recordID ?id. ' +
      'OPTIONAL{?archivalResource <http://www.w3.org/2006/time#intervalStarts> ?startDate.} ' +
      'OPTIONAL{?archivalResource <http://www.w3.org/2006/time#intervalEnds> ?endDate.} ' +
      '?title stardog:property:textMatch (\'' + names + '\').' +
      '}';

    //Encode the query and add to the endpoint query url
    let getUrl = endpointUrl+encodeURIComponent(query);

    //Send the request via HTTP protocol with the headers
    //return an observable of the result array
    return this.http.get(getUrl, {headers: this.getHeaders()})
      .map(
        (response: Response) => {
          //Parse the response in JSON
          //Get the results array
          let data = response.json().results.bindings;

          //Instantiation of the result array
          let elements: ArchivalResources[] = [];

          //Temporary object used to ease the instantiation of the ArchivalResource objects
          let current: ArchivalResources;

          //Loop on the result array
          for (const e of data) {
            //Object instance without the period
            current = new ArchivalResources(e.id.value, e.archivalResource.value, e.title.value, e.signature.value, null, null);

            //Add start date if exists
            if(e.hasOwnProperty('startDate')){
              current.startDate = +e.startDate.value;
            }

            //Add end date if exists
            if(e.hasOwnProperty('endDate')){
              current.endDate = +e.endDate.value;
            }

            //Add object to the result array
            elements.push(current);
          }

          //return the result array
          return elements;
        }
      );
  }

  /**
   * Method that construct the string used to make the matching between municipalities version names and the archival resources titles in the SPARQL query
   *
   * @param current Main municipality version to search
   * @param relatedVersions Municipality versions related to the main one
   * @returns {string} to add to the SPARQL query
   */
  private constructNamesString(current: MunicipalityVersion, relatedVersions: MunicipalityVersion[]): string{
    //create empty string
    let names: string = '';

    //Add current name between double quotes
    names = names + "\"" + current.name + "\"";

    //Loop to add related versions names
    for (let version of relatedVersions) {
      //test to add distinct names
      if (names.indexOf(version.name) == -1) {
        //Add OR between names
        names = names + " OR " + "\"" + version.name + "\"";
      }
    }

    return names;
  }
}
