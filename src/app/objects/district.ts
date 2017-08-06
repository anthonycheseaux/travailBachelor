import {Mutation} from "./mutation";
/**
 * The object District
 */
export class District{
  id: number;
  name: string;
  uri: string;
  admissionMutation: Mutation;
  abolitionMutation: Mutation;

  constructor(id:number, name: string, uri: string, admissionMutation: Mutation, abolitionMutation: Mutation){
    this.id = id;
    this.name = name;
    this.uri = uri;
    this.admissionMutation = admissionMutation;
    this.abolitionMutation = abolitionMutation;
  }
}
