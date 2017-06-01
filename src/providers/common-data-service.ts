/*
* @name: common-data-service.ts
* @description: The Common data service module
* @author: PSI Mobile Ltd
* @copyright: PSI Mobile Ltd
* @version: 1.0.0
*/
import {Injectable} from '@angular/core';
import {Http, Headers} from '@angular/http';

@Injectable()
export class CommonDataService {
    public apiAddress = 'api.psi-fusion.com';
    public apiPort = '';  
    public devtest = false;    
    private username = '';
    private password = '';

    constructor(private http:Http) {
      if (this.devtest == true) {
          this.apiAddress = '192.168.2.105';
          this.apiPort = ':20005';
      } else {
          this.apiAddress = 'api.psi-fusion.com';
          this.apiPort = '';
      }          
    }

    performLookup(forminput, form) {
        // THIS NEEDS BIG IMPROVEMENT
        if (forminput.lookup != null) {
            var result;        

            var headers:any = new Headers();
            headers.append('Content-Type', 'application/json');
            
            var user:any = {
                name: this.username,
                password: this.password
            };

            var url = 'https://' + this.apiAddress + this.apiPort + '/ct/search?' + 
                "dbname=" + forminput.lookup[0].datasource + "&" + 
                "countonly=" + (forminput.lookup[0].countonly ? 1 : 0) + "&" + 
                "wildcard=" + (forminput.lookup[0].iswildcard ? 1 : 0);

            // this forces a deep copy as changing the condition object will have repurcussions for going back/forward
            var clonedfilters = JSON.parse(JSON.stringify(forminput.lookup[0].filters));

            clonedfilters = this.parseCondition(clonedfilters, form);  

            for(var i = 0; i < clonedfilters.length; i++) {
                url += "&filter[";
                url += clonedfilters[i].name + "]=";
                url += clonedfilters[i].value;
            }

            this.http.post(url, JSON.stringify(user), {headers: headers})
            .timeout(5000, new Error('Timeout encountered on online lookup'))
            .map(res => res.json())
            .subscribe(
                data => result = data,
                err => {
                    console.log(err);
                },
                () => {
                    if (result.err) {
                        if ((result != null) && (result.err != null)) {
                            console.log(result.err.reason);
                        } else {
                            console.log('Unknown error');
                        }
                    } else {
                        //console.log("OUTPUT: " + result);
                    }
                }
            );
        }
    }

    parseCondition(filters, form) {
        for(var h = 0; h < filters.length; h++) { 
            for(var i = 0; i < form.sections.length; i++) { 
                for(var j = 0; j < form.sections[i].screens.length; j++) { 
                    for(var k = 0; k < form.sections[i].screens[j].fields.length; k++) { 
                        if (form.sections[i].screens[j].fields[k].id == filters[h].value) {
                            filters[h].value = form.sections[i].screens[j].fields[k].value;

                            break;
                        }
                    }                    
                }            
            }
        }

        return filters;
    }              
}