import { Injectable } from '@angular/core';

import { SqliteService } from './sqlite-service';

@Injectable()
export class DalService {
  public databaseType = 'sqlite';

  constructor(public sqliteService: SqliteService) {
    switch (this.databaseType.toLowerCase()) {
        case "sqlite":
            this.databaseType = this.databaseType.toLowerCase();
        default:
            this.databaseType = "sqlite";
    }
  }

  // START REAL METHODS HERE
  setDatabaseName(databaseName) {
    switch (this.databaseType) {
        case "sqlite":
            this.sqliteService.setDatabaseName(databaseName);
        default:
            // throw error
    }
  }

  saveForms(forms) {
    switch (this.databaseType) {
        case "sqlite":
            return this.sqliteService.saveForms(forms);
        default:
            return this.sqliteService.saveForms(forms);
    }      
  }  

  getForms() {
    switch (this.databaseType) {
        case "sqlite":
            //this.sqliteService.getForms();
        default:
            // throw error
    }      
  }    

  // THE BELOW METHODS SHOULD NOT BE CALLED - THEY WERE INTRODUCED FOR TEST 
  // PURPOSES ONLY
  initialiseDatabase(databaseName) {
    //TODO PARAMS

    switch (this.databaseType) {
        case "sqlite":
            //TODO RETRIEVE RESPONSE/DATA
            this.sqliteService.initialiseDatabase(databaseName);
        default:
            // throw error
    }

    //TODO RETURN RESPONSE/DATA
  }

  closeDatabase() {
    //TODO PARAMS

    switch (this.databaseType) {
        case "sqlite":
            //TODO RETRIEVE RESPONSE/DATA
            this.sqliteService.closeDatabase();
        default:
            // throw error
    }

    //TODO RETURN RESPONSE/DATA
  }  

  deleteDatabase(databaseName) {
    //TODO PARAMS

    switch (this.databaseType) {
        case "sqlite":
            //TODO RETRIEVE RESPONSE/DATA
            this.sqliteService.deleteDatabase(databaseName);
        default:
            // throw error
    }

    //TODO RETURN RESPONSE/DATA
  }  

  createCollection(collectionName, fields) {
    //TODO PARAMS

    switch (this.databaseType) {
        case "sqlite":
            //TODO RETRIEVE RESPONSE/DATA
            this.sqliteService.createCollection(collectionName, fields);
        default:
            // throw error
    }

    //TODO RETURN RESPONSE/DATA
  }

  deleteCollection(collectionName) {
    //TODO PARAMS

    switch (this.databaseType) {
        case "sqlite":
            //TODO RETRIEVE RESPONSE/DATA
            this.sqliteService.deleteCollection(collectionName);
        default:
            // throw error
    }

    //TODO RETURN RESPONSE/DATA
  }  

  getData(collectionName, fieldname, fieldvalue) {
    //TODO PARAMS

    switch (this.databaseType) {
        case "sqlite":
            //TODO RETRIEVE RESPONSE/DATA
            this.sqliteService.getData(collectionName, fieldname, fieldvalue);
        default:
            // throw error
    }

    //TODO RETURN RESPONSE/DATA
  }

  addData(collectionName, fieldvalue) {
    //TODO PARAMS

    switch (this.databaseType) {
        case "sqlite":
            //TODO RETRIEVE RESPONSE/DATA
            this.sqliteService.addData(collectionName, fieldvalue);
        default:
            // throw error
    }

    //TODO RETURN RESPONSE/DATA
  }

  updateData(collectionName, fieldname, fieldvalue) {
    //TODO PARAMS

    switch (this.databaseType) {
        case "sqlite":
            //TODO RETRIEVE RESPONSE/DATA
            this.sqliteService.updateData(collectionName, fieldname, fieldvalue);
        default:
            // throw error
    }

    //TODO RETURN RESPONSE/DATA
  }

  deleteData(collectionName, fieldname, fieldvalue) {
    //TODO PARAMS

    switch (this.databaseType) {
        case "sqlite":
            //TODO RETRIEVE RESPONSE/DATA
            this.sqliteService.deleteData(collectionName, fieldname, fieldvalue);
        default:
            // throw error
    }

    //TODO RETURN RESPONSE/DATA
  } 

  setDatabaseType(dbtype) {
    this.databaseType = dbtype;
  }
}
