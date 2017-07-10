import {PipeTransform, Pipe} from "@angular/core";
import {MunicipalityVersion} from "../objects/municipality-version";

@Pipe({
  name: 'municipalityVersionSort'
})
export class ArraySortPipe implements PipeTransform {
  transform(array: Array<MunicipalityVersion>): Array<MunicipalityVersion> {
    let active: MunicipalityVersion;
    let toDelete: number;

    array.forEach((item, index) => {
      if(!item.abolitionMutation){
        active = item;
        toDelete = index;
      }
    });

    console.log(array);

    array.splice(toDelete, 1);

    console.log(array);

    array.sort((a: any, b: any) => {
      if (a.admissionMutation.date < b.admissionMutation.date) {
        return -1;
      }
      else if (a.admissionMutation.date > b.admissionMutation.date) {
        return 1;
      }
      else {
        return 0;
      }
    });

    array.sort((a: any, b: any) => {
      if (a.abolitionMutation.date < b.abolitionMutation.date) {
        return -1;
      }
      else if (a.abolitionMutation.date > b.abolitionMutation.date) {
        return 1;
      }
      else {
        return 0;
      }
    });



    array.push(active);

    return array;
  }
}
