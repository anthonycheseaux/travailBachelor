export class ArchivalResources {
  id: number;
  uri: string;
  title: string;
  signature: string;
  startDate: number;
  endDate: number;

  constructor(id: number, uri: string, title: string, signature: string, startDate: number, endDate: number) {
    this.id = id;
    this.uri = uri;
    this.title = title;
    this.signature = signature;
    this.startDate = startDate;
    this.endDate = endDate;
  }
}
