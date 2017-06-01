import {Injectable} from '@angular/core';
import {BarcodeScanner} from 'ionic-native';

@Injectable()
export class BarcodeService {
    constructor() {
        
    }

    scan():Promise<any> {
        return new Promise((resolve, reject) => {
            BarcodeScanner.scan().then((barcodeData:any) => {
                resolve(barcodeData);
            }, (err) => {
                reject(err);
            });
        });
    }
}
