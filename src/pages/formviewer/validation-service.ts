/*
* @name: validation-service.ts
* @description: The Form Viewer validation service typescript class
* @author: PSI Mobile Ltd
* @copyright: PSI Mobile Ltd
* @version: 1.0.0
*/

export class ValidationService {
    static doValidationCheck(formValue, formType, formPattern, formMessage) {
        if (formPattern != "") {
            return this.customValidator(formValue, formPattern, formMessage);  
        }
        else {
            switch (formType) {
                case "text" :
                    return this.stringValidator(formValue, formMessage);
                case "number" :
                    return this.numberValidator(formValue, formMessage);                    
                case "date" :
                    return this.dateValidator(formValue, formMessage);
                case "time" :
                    return this.timeValidator(formValue, formMessage);                      
                case "tel" :
                    return this.numberValidator(formValue, formMessage);                    
                case "password" :
                    return this.passwordValidator(formValue, formMessage);
                case "url" :
                    return this.urlValidator(formValue, formMessage);                    
                case "email" :
                    return this.emailValidator(formValue, formMessage);
                case "creditcard" :
                    return this.creditCardValidator(formValue, formMessage);
                case "image" :
                    return this.imageValidator(formValue, formMessage);                       
            }
        }
        
        return '';
    }

    static numberValidator(formValue, formMessage) {
        // Number is not invalid
        if ((formValue.trim() != '') && (isNaN(formValue) == false)) {
            return '';
        } else {
            if (formMessage.trim() != '') {
                return formMessage;
            }
            else {
                return 'Must be a valid number.';
            }
        }
    }
    
    static dateValidator(formValue, formMessage) {
        // Date is not invalid
        /*var dateValid = false;
        
        if ( Object.prototype.toString.call(formValue) === "[object Date]" ) {
            dateValid = true;
        }
        else {
            dateValid = false;
        }*/
        
        var timestamp = Date.parse(formValue);

        if (isNaN(timestamp) == false)
        {
            return '';
        }                
        
        if (formMessage.trim() != '') {
            return formMessage;
        }
        else {
            return 'Must be a valid date.';
        }
    } 
    
    static timeValidator(formValue, formMessage) {
        // Valid date format
        if (formValue.match(/([01]?[0-9]|2[0-3]):[0-5][0-9]/)) {
            return '';
        } else {
            if (formMessage.trim() != '') {
                return formMessage;
            }
            else {            
                return 'Invalid time.';
            }
        }
    }
    
    static urlValidator(formValue, formMessage) {
        // Valid date format
        if (formValue.match(/(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/)) {
            return '';
        } else {
            if (formMessage.trim() != '') {
                return formMessage;
            }
            else {            
                return 'Invalid URL.';
            }
        }
    }       
    
    static stringValidator(formValue, formMessage) {
        // String is not empty
        if (formValue.trim() != '') {
            return '';
        } else {
            if (formMessage.trim() != '') {
                return formMessage;
            }
            else {            
                return 'Text must not be empty.';
            }
        }
    }    

    static creditCardValidator(formValue, formMessage) {
        // Visa, MasterCard, American Express, Diners Club, Discover, JCB
        if (formValue.match(/^(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|6(?:011|5[0-9][0-9])[0-9]{12}|3[47][0-9]{13}|3(?:0[0-5]|[68][0-9])[0-9]{11}|(?:2131|1800|35\d{3})\d{11})$/)) {
            return '';
        } else {
            if (formMessage.trim() != '') {
                return formMessage;
            }
            else {            
                return 'Invalid credit card number.';
            }
        }
    }

    static emailValidator(formValue, formMessage) {
        // RFC 2822 compliant regex
        if (formValue.match(/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/)) {
            return '';
        } else {
            if (formMessage.trim() != '') {
                return formMessage;
            }
            else {            
                return 'Invalid email address.';
            }
        }
    }

    static passwordValidator(formValue, formMessage) {
        // {6,100}           - Assert password is between 6 and 100 characters
        // (?=.*[0-9])       - Assert a string has at least one number
        if (formValue.match(/^(?=.*[0-9])[a-zA-Z0-9!@#$%^&*]{6,100}$/)) {
            return '';
        } else {
            if (formMessage.trim() != '') {
                return formMessage;
            }
            else {            
                return 'Password must be at least 6 characters long, and contain a number.';
            }
        }
    }
    
    static customValidator(formValue, formPattern, formMessage) {
        // {6,100}           - Assert password is between 6 and 100 characters
        // (?=.*[0-9])       - Assert a string has at least one number
        if (formValue.match(formPattern)) {
            return '';
        } else {
            if (formMessage.trim() != '') {
                return formMessage;
            }
            else {            
                return 'Invalid (no reason specified)';
            }
        }
    }   
    
    static imageValidator(formValue, formMessage) {
        // image is not empty
        if (formValue.trim() != '') {
            return '';
        } else {
            if (formMessage.trim() != '') {
                return formMessage;
            }
            else {            
                return 'An image must captured/selected.';
            }
        }
    }      
}
