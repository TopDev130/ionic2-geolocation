import {Pipe} from '@angular/core';

@Pipe({
  name: "orderby"
})
export class OrderByPipe {
  /*transform(array: Array<string>, args: string): Array<string> {
    array.sort((a: any, b: any) => {
      if (a.lifecycle.activationtime < b.lifecycle.activationtime) {
        return -1;
      } else if (a.lifecycle.activationtime > b.lifecycle.activationtime) {
        return 1;
      } else {
        return 0;
      }
    });
    return array;
  }*/
}