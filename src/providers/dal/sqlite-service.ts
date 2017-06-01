import { Injectable } from '@angular/core';
import { AlertController } from 'ionic-angular';

import { SQLite } from 'ionic-native';

@Injectable()
export class SqliteService {
  public db: SQLite;
  public dbName: any;

  constructor(private alertCtrl: AlertController) {
    this.db = new SQLite();
  }

  // START REAL METHODS HERE 2
  setDatabaseName(databaseName) {
    this.dbName = databaseName + '.db';
  }

  saveForms(forms) {
    return this.db.openDatabase({
      name: this.dbName,
      location: 'default' // the location field is required
    }).then(() => {
      if ((forms != null) && (forms.length > 0)) {
        var fieldsToAdd = 'formid, formname, formdescription, created, lastupdated, formjson';

        return this.db.executeSql('CREATE TABLE IF NOT EXISTS FORMS(' + fieldsToAdd + ')', {}).then(() => {
          //this.db.executeSql('DELETE * FROM ' + collectionName, {}).then(() => {
          var formid = '';
          var formname = '';
          var formdescription = '';
          var created = '';
          var lastupdated = '';
          var formjson = '';

          for(var i = 0; i < forms.length; i++) { 
            formid = forms[i]._id;
            formname = forms[i].name;
            formdescription = forms[i].description;
            created = forms[i].created_at;
            lastupdated = forms[i].updated_at;
            formjson = forms[i];

            return this.db.executeSql('INSERT OR REPLACE INTO FORMS VALUES (?,?,?,?,?,?)', 
            [formid, formname, formdescription, created, lastupdated, formjson]).then(() => {
              return this.db.close().then(() => {
                return "ALLOPERATIONSSUCCESS";
              }, (err) => {
                return "Unable to close database";
              });
            }, (err) => {
              return "Unable to execute forms insert or replace sql";
            });
          }
          //}, (err) => {
          //  this.doAlert("Unable to execute forms delete all sql", err);
          //});
        }, (err) => {
          return "Unable to execute create forms table sql";
        });         
      } else {
        return "NOFORMS";
      }
    }, (err) => {
        //this.doAlert("Unable to initialise database", err);
      return "ERROROPENDATABASE";
    });      
  }
  // START REAL METHODS HERE 2

  // START REAL METHODS HERE
  /*saveForms(forms) {
    // get the different form types for saving to individual tables
    var formsTemplates = [];
    var formsSaved = [];

    if (forms != null) {
      for(var i = 0; i < forms.length; i++) {
        if (forms[i].status != null) {
          if (forms[i].status.id == '1') {
            if ((forms[i].type == 'form') || (forms[i].type == 'form-ready')) {
                formsTemplates.push(forms[i]);
            } else if (forms[i].type == 'form-saved') {
                formsSaved.push(forms[i]);
            }
          }
        }
      }
    }

    var formTypes = [];

    if (formsTemplates.length > 0) {
      formTypes.push("templates");
    }

    if (formsSaved.length > 0) {
      formTypes.push("saved");
    }

    if (formTypes.length > 0) {
      this.db = new SQLite();

      this.db.openDatabase({
        name: this.dbName,
        location: 'default' // the location field is required
      }).then(() => {
        this.saveFormsByType(formsTemplates, formsSaved, formTypes);
      }, (err) => {
        this.doAlert("Unable to initialise database", err);
      });
    }
  }

  saveFormsByType(formsTemplates, formsSaved, formTypes) {
    var currentType = '';
    var collectionName = '';
    var forms;

    if (formTypes.length == 0) {
      return;
    } else {
      currentType = formTypes[0];

      formTypes.shift();

      if (currentType == "templates")
      {
        collectionName = 'formstemplates';
        forms = formsTemplates;
      } else if (currentType == "saved")
      {
        collectionName = 'formssaved';
        forms = formsSaved;
      } else {
        this.db.close().then(() => {
          // COMPLETE
        }, (err) => {
          this.doAlert("Unable to close database", err);
        }); 

        return;
      }     
    }

    var fieldsToAdd = 'formid, formname, formdescription, created, lastupdated, formjson';

    this.db.executeSql('CREATE TABLE IF NOT EXISTS ' + collectionName + '(' + fieldsToAdd + ')', {}).then(() => {
      //this.db.executeSql('DELETE * FROM ' + collectionName, {}).then(() => {
        if (forms.length > 0) {
          var formid = '';
          var formname = '';
          var formdescription = '';
          var created = '';
          var lastupdated = '';
          var formjson = '';

          for(var i = 0; i < forms.length; i++) { 
            formid = forms[i]._id;
            formname = forms[i].name;
            formdescription = forms[i].description;
            created = forms[i].created_at;
            lastupdated = forms[i].updated_at;
            formjson = forms[i];

            this.db.executeSql('INSERT OR REPLACE INTO ' + collectionName + ' VALUES (?,?,?,?,?,?)', 
            [formid, formname, formdescription, created, lastupdated, formjson]).then(() => {
              //this.doAlert("formid, formname, formdescription, created, lastupdated, formjson: " + 
              //formid + ", " + formname + ", " + formdescription + ", " + created + ", " + lastupdated + ", " + formjson, "SUCCESS");

              // now we move to next form type if exists
              if (i == (forms.length - 1)) {
                if (formTypes.length > 0) {
                  this.saveFormsByType(formsTemplates, formsSaved, formTypes);
                } else {
                  this.db.close().then(() => {
                    return;
                  }, (err) => {
                    this.doAlert("Unable to close database", err);
                  }); 
                }
              }
            }, (err) => {
              this.doAlert("Unable to execute forms insert or replace sql", err);
            });
          }
        }
      //}, (err) => {
      //  this.doAlert("Unable to execute forms delete all sql", err);
      //});
    }, (err) => {
      this.doAlert("Unable to execute create forms table sql", err);
    });   
  }

  getForms() {
    this.db = new SQLite();

    this.db.openDatabase({
      name: this.dbName,
      location: 'default' // the location field is required
    }).then(() => {
      this.db.executeSql('SELECT * FROM ' + 'formstemplates', {}).then((resp) => {
        var forms = [];

        if (resp.rows.length > 0) {
          for (var i = 0; i < resp.rows.length; i++) {
            let item = resp.rows.item(i);
            forms.push(JSON.parse(item['formjson']));
          }
        }

        this.formsService._forms = forms;
        //this.doAlert("Form(s) Found!", JSON.stringify(this.formsService._forms[0]));  
        this.formsService.setupFormsObjects(); 
      }, (err) => {
        this.doAlert("Unable to execute select sql", err);
      });      
    }, (err) => {
      this.doAlert("Unable to initialise database", err);
    });    
  }*/

  // THE BELOW METHODS SHOULD NOT BE CALLED - THEY WERE INTRODUCED FOR TEST 
  // PURPOSES ONLY
  initialiseDatabase(databaseName) {
    this.db = new SQLite();

    this.db.openDatabase({
      name: databaseName + '.db',
      location: 'default' // the location field is required
    }).then(() => {
      this.doAlert("Initialise Database", "SUCCESS");
    }, (err) => {
      this.doAlert("Unable to open database", err);
    });
  } 

  closeDatabase() {
    this.db.close().then(() => {
      this.doAlert("Closed Database", "SUCCESS");
    }, (err) => {
      this.doAlert("Unable to close database", err);
    }); 
  }

  deleteDatabase(databaseName) {
    SQLite.deleteDatabase({
      name: databaseName + '.db',
      location: 'default' // the location field is required
    }).then(() => {
      this.doAlert("Delete Database", "SUCCESS");
    }, (err) => {
      this.doAlert("Unable to delete database", err);
    });
  }  

  createCollection(collectionName, fields) {
    var fieldsToAdd = "";

    for (var i = 0; i < fields.length; i++) {
      fieldsToAdd += fields[i].name + " " + fields[i].type;

      if (i != fields.length - 1) {
        fieldsToAdd += ", ";
      }      
    }

    this.db.executeSql('CREATE TABLE IF NOT EXISTS ' + collectionName + '(' + fieldsToAdd + ')', {}).then(() => {
      this.doAlert("Create Database Table", "SUCCESS");
    }, (err) => {
      this.doAlert("Unable to execute create table sql", err);
    });
  }

  deleteCollection(collectionName) {
    this.db.executeSql('DROP TABLE IF EXISTS ' + collectionName, {}).then(() => {
      this.doAlert("Delete Database Table", "SUCCESS");
    }, (err) => {
      this.doAlert("Unable to execute drop table sql", err);
    });
  }  

  getData(collectionName, fieldname, fieldvalue) {
    this.db.executeSql('SELECT * FROM ' + collectionName + ' WHERE ' + fieldname + ' = ?', [fieldvalue]).then((resp) => {
      var coldata = "";
      
      if (resp.rows.length > 0) {
        for (var i = 0; i < resp.rows.length; i++) {
          let item = resp.rows.item(i);
          if (i == 0) {
            coldata += item[fieldname];
          } else {
            coldata += ", " + item[fieldname];
          }
        }
      }
      this.doAlert("Get Database Data", coldata);
    }, (err) => {
      this.doAlert("Unable to execute select sql", err);
    });
  }

  addData(collectionName, fieldvalue) {
    this.db.executeSql('INSERT OR REPLACE INTO ' + collectionName + ' VALUES (?)', [fieldvalue]).then(() => {
      this.doAlert("Add Database Data", "SUCCESS");
    }, (err) => {
      this.doAlert("Unable to execute insert or replace sql", err);
    });
  }

  updateData(collectionName, fieldname, fieldvalue) {
    this.db.executeSql('UPDATE ' + collectionName + ' SET ' + fieldname + ' = ?', [fieldvalue]).then(() => {
      this.doAlert("Update Database Data", "SUCCESS");
    }, (err) => {
      this.doAlert("Unable to execute update sql", err);
    });
  }

  deleteData(collectionName, fieldname, fieldvalue) {
    this.db.executeSql('DELETE FROM ' + collectionName + ' WHERE ' + fieldname + ' = ?', [fieldvalue]).then(() => {
      this.doAlert("Delete Database Data", "SUCCESS");
    }, (err) => {
      this.doAlert("Unable to execute delete sql", err);
    });
  } 

  doAlert(titleAlert, subTitleAlert) {
    let alert = this.alertCtrl.create({
      title: titleAlert,
      subTitle: subTitleAlert,
      buttons: ['OK']
    });
    alert.present();
  }   
}
