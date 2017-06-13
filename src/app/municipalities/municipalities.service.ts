import { Injectable } from '@angular/core';
import { Headers, Http, Response } from '@angular/http'
import 'rxjs/Rx';

@Injectable()
export class MunicipalitiesService {
  constructor(private http: Http) {}

  getAllMunicipalities() {
    let endpointUrl: string = 'https://lindasprd.netrics.ch:8443/lindas/query?query=';

    let query:string =
      'select distinct ?name ' +
      'where {' +
      '?municipality a <https://gont.ch/PoliticalMunicipality>; ' +
      '?predicat ?version.' +
      '?version a <https://gont.ch/MunicipalityVersion>.' +
      '?version <https://gont.ch/longName> ?name.' +
      '}' +
      'ORDER BY ASC (?name)';

    let username: string = 'public';
    let password: string = 'public';
    let headers: Headers = new Headers();
    headers.append("Authorization", "Basic " + btoa(username + ":" + password));
    headers.append("Accept", "application/sparql-results+json");

    return this.http.get(endpointUrl+encodeURIComponent(query), {headers: headers})
      .map(
        (response: Response) => {
          let data = response.json().results.bindings;
          let elements: string[] = [];

          for(const e of data){
            elements.push(e.name.value);
          }

          return elements;
        }
      );
  }
}
