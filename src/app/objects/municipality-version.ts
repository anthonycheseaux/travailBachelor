import {Mutation} from "./mutation";

/**
 * The object MunicipalityVersion
 */
export class MunicipalityVersion {

  id: number;
  uri: string;
  name: string;
  municipality: number;
  //true = active ; false = inactive
  state: boolean;
  canton: string;
  district: string;
  admissionMutation: Mutation;
  abolitionMutation: Mutation;

  constructor(id: number, uri: string, name: string, municipality: number,
              state: boolean, canton: string, district: string,
              admissionMutation: Mutation, abolitionMutation: Mutation){
    this.id = id;
    this.uri = uri;
    this.name = name;
    this.municipality = municipality;
    this.state = state;
    this.canton = canton;
    this.district = district;
    this.admissionMutation = admissionMutation;
    this.abolitionMutation = abolitionMutation;
  }
}
