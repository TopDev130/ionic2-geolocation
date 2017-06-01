/*
* @name: logic-service.ts
* @description: The Form Viewer logic service typescript class
* @author: PSI Mobile Ltd
* @copyright: PSI Mobile Ltd
* @version: 1.0.0
*/
import {Injectable} from '@angular/core';
//let JsonLogic = require('json-logic-js');
import JsonLogic from 'json-logic-js';

@Injectable()
export class LogicService {
    applyFormFieldLogic(form, 
        field, 
        condition,
        action, 
        destination) {

        // this forces a deep copy as changing the condition object will have repurcussions for going back/forward
        var clonedcondition = JSON.parse(JSON.stringify(condition));

        clonedcondition = this.parseCondition(clonedcondition, form);

        // validate condition
        if (JsonLogic.apply(clonedcondition) == true) {
            switch (action) {
                case "show" :
                    field.hidden = false;
                    return field;
                case "hide" :
                    field.hidden = true;
                    return field;          
            }
        } else {
            switch (action) {
                case "show" :
                    field.hidden = true;
                    return field;
                case "hide" :
                    field.hidden = false;
                    return field;           
            }
        }

        return field;
    }

    applyFormSectionLogic(form, condition) {
        // this forces a deep copy as changing the condition object will have repurcussions for going back/forward
        var clonedcondition = JSON.parse(JSON.stringify(condition));

        clonedcondition = this.parseCondition(clonedcondition, form);       

        // validate condition
        return JsonLogic.apply(clonedcondition);
    }

    parseCondition(condition, form) {
        for(var i = 0; i < form.sections.length; i++) { 
            for(var j = 0; j < form.sections[i].screens.length; j++) { 
                for(var k = 0; k < form.sections[i].screens[j].fields.length; k++) { 
                    // force a numerical compare as strings won't work
                    if (form.sections[i].screens[j].fields[k].subtype == "number") {
                        condition = this.parseObjects(condition, '', form.sections[i].screens[j].fields[k].id, parseFloat(form.sections[i].screens[j].fields[k].value));
                    } else if (form.sections[i].screens[j].fields[k].supertype == "checkbox") {
                        // loop through all opts
                        for(var l = 0; l < form.sections[i].screens[j].fields[k].options.length; l++) {
                            condition = this.parseObjects(condition, '', form.sections[i].screens[j].fields[k].options[l].id, form.sections[i].screens[j].fields[k].options[l].checked);
                        }
                    } else {
                        condition = this.parseObjects(condition, '', form.sections[i].screens[j].fields[k].id, form.sections[i].screens[j].fields[k].value);
                    }
                }                    
            }            
        }

        return condition;
    }    

    getObjects(obj, key, val) {
        var objects = [];
        for (var i in obj) {
            if (!obj.hasOwnProperty(i)) continue;
            if (typeof obj[i] == 'object') {
                objects = objects.concat(this.getObjects(obj[i], key, val));    
            } else 
            //if key matches and value matches or if key matches and value is not passed (eliminating the case where key matches but passed value does not)
            if (i == key && obj[i] == val || i == key && val == '') { //
                objects.push(obj);
            } else if (obj[i] == val && key == ''){
                //only add if the object is not already in the array
                if (objects.lastIndexOf(obj) == -1){
                    objects.push(obj);
                }
            }
        }
        return objects;
    }

    parseObjects(obj, key, val, fieldvalue) {
        var objects = [];
        for (var i in obj) {
            if (!obj.hasOwnProperty(i)) continue;
            if (typeof obj[i] == 'object') {
                objects = objects.concat(this.parseObjects(obj[i], key, val, fieldvalue));    
            } else 
            //if key matches and value matches or if key matches and value is not passed (eliminating the case where key matches but passed value does not)
            if (i == key && obj[i] == val || i == key && val == '') { //
                objects.push(obj);
                for(var j = 0; j < obj.length; j++) { 
                    if (val == obj[j]) {
                        obj[j] = fieldvalue;
                    }
                }
            } else if (obj[i] == val && key == ''){
                //only add if the object is not already in the array
                if (objects.lastIndexOf(obj) == -1){
                    objects.push(obj);
                    for(var j = 0; j < obj.length; j++) { 
                        if (val == obj[j]) {
                            obj[j] = fieldvalue;
                        }
                    }                    
                }
            }
        }
        return obj;
    }    

    getValues(obj, key) {
        var objects = [];
        for (var i in obj) {
            if (!obj.hasOwnProperty(i)) continue;
            if (typeof obj[i] == 'object') {
                objects = objects.concat(this.getValues(obj[i], key));
            } else if (i == key) {
                objects.push(obj[i]);
            }
        }
        return objects;
    }

    getKeys(obj, val) {
        var objects = [];
        for (var i in obj) {
            if (!obj.hasOwnProperty(i)) continue;
            if (typeof obj[i] == 'object') {
                objects = objects.concat(this.getKeys(obj[i], val));
            } else if (obj[i] == val) {
                objects.push(i);
            }
        }
        return objects;
    }    
}