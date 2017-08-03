/**
 * The object District
 */
export class District{
  id: number;
  name: string;
  uri: string;
  admissionMode: string;
  abolitionMode: string;

  constructor(id:number, name: string, uri: string, admissionMode: string, abolitionMode: string){
    this.id = id;
    this.name = name;
    this.uri = uri;
    this.admissionMode = admissionMode;
    this.abolitionMode = abolitionMode;
  }
}
