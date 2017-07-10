import {Injectable} from "@angular/core";
import {Headers, Http, Response} from "@angular/http";
import {ArchivalResources} from "../objects/archival-resources";

const endpointUrl  = 'https://lindas-data.ch:8443/alod/query?query=';

@Injectable()
export class ArchivalResourcesService {
  constructor(private http: Http) {}

  private getHeaders() {
    let username: string = 'public';
    let password: string = 'public';
    let headers: Headers = new Headers();

    headers.append("Authorization", "Basic " + btoa(username + ":" + password));
    headers.append("Accept", "application/sparql-results+json");

    return headers;
  }

  getArchivalResourcesMatchingNames(names: string){
    let query:string = 'PREFIX dcterms: <http://purl.org/dc/terms/> ' +
      'PREFIX alod: <http://data.admin.ch/alod/> ' +
      'PREFIX ukArch: <http://data.archiveshub.ac.uk/def/> ' +
      'SELECT DISTINCT ?a ?id ?title ?signature ?start ?end ' +
      'WHERE { ' +
      'GRAPH <http://data.alod.ch/graph/bar>{ ' +
      '?a a <http://data.archiveshub.ac.uk/def/ArchivalResource>.} ' +
      '?a dcterms:title ?title; ' +
      'alod:referenceCode ?signature; ' +
      'alod:recordID ?id. ' +
      'OPTIONAL{?a <http://www.w3.org/2006/time#intervalStarts> ?start.} ' +
      'OPTIONAL{?a <http://www.w3.org/2006/time#intervalEnds> ?end.} ' +
      '?title stardog:property:textMatch (\'' + names + '\').' +
      '}';

    let getUrl = endpointUrl+encodeURIComponent(query);

    return this.http.get(getUrl, {headers: this.getHeaders()})
      .map(
        (response: Response) => {
          let data = response.json().results.bindings;
          let elements: ArchivalResources[] = [];

          console.log(data);

          for (const e of data) {

          }

          return elements;
        }
      );
  }
}
