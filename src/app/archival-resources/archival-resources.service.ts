import {Injectable} from "@angular/core";
import {Http} from "@angular/http";

const endpointUrl  = 'https://lindasprd.netrics.ch:8443/alod/query?query=';

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


}
