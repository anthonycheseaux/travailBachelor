import {Injectable} from "@angular/core";
import {Headers, Http, Response} from "@angular/http";
import {ArchivalResources} from "../objects/archival-resources";
import {MunicipalityVersion} from "../objects/municipality-version";

const endpointUrl  = 'https://lindas-data.ch:8443/alod/query?query=';

@Injectable()
export class ArchivalResourcesService {
  constructor(private http: Http) {}

  private getHeaders(){
    let username: string = 'public';
    let password: string = 'public';
    let headers: Headers = new Headers();

    headers.append("accept", "application/sparql-results+json");
    headers.append("authorization", "basic " + btoa(username + ":" + password));

    return headers;
  }

  getArchivalResourcesMatchingNames(version: MunicipalityVersion, related: MunicipalityVersion[]){

    let names: string = '';

    names = this.constructNamesString(version, related);

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

    let getUrl = endpointUrl+encodeURIComponent(query);

    return this.http.get(getUrl, {headers: this.getHeaders()})
      .map(
        (response: Response) => {
          let data = response.json().results.bindings;
          let elements: ArchivalResources[] = [];
          let current: ArchivalResources;

          for (const e of data) {
            current = new ArchivalResources(e.id.value, e.archivalResource.value, e.title.value, e.signature.value, null, null);

            if(e.hasOwnProperty('startDate')){
              current.startDate = +e.startDate.value;
            }

            if(e.hasOwnProperty('endDate')){
              current.endDate = +e.endDate.value;
            }

            elements.push(current);
          }

          return elements;
        }
      );
  }

  private constructNamesString(current: MunicipalityVersion, relatedVersions: MunicipalityVersion[]): string{
    let names: string = '';

    names = names + "\"" + current.name + "\"";

    if(relatedVersions.length > 0){
      for (let version of relatedVersions) {
        if (names.indexOf(version.name) == -1) {
          names = names + " OR " + "\"" + version.name + "\"";
        }
      }
    }

    return names;
  }
}
