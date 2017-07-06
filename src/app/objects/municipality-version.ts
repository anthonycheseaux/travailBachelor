import {Mutation} from "./mutation";

export class MunicipalityVersion {
  id: number;
  uri: string;
  name: string;
  municipality: number;
  state: string;
  canton: string;
  district: string;
  admissionMutation: Mutation;
  abolitionMutation: Mutation;

  constructor(id: number, uri: string, name: string, municipality: number,
              state: number, canton: string, district: string,
              admissionMutation: Mutation, abolitionMutation: Mutation){
    this.id = id;
    this.uri = uri;
    this.name = name;
    this.municipality = municipality;
    this.state = State[state];
    this.canton = canton;
    this.district = district;
    this.admissionMutation = admissionMutation;
    this.abolitionMutation = abolitionMutation;
  }
}

enum State {
  "Inconnu" = -1,
  "Actif" = 0,
  "Inactif" = 1
}
