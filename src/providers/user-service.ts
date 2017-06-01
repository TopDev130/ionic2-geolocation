/*
* @name: user-service.ts
* @description: The user data service module
* @author: PSI Mobile Ltd
* @copyright: PSI Mobile Ltd
* @version: 1.0.0
*/
import {Injectable} from '@angular/core';
import {Events} from 'ionic-angular';

@Injectable()
export class UserService {
    private username;
    private userid;
    private token;
    private password;  
    private loggedIn;  
    _favorites = [];

    constructor(private events: Events) {}

    login(username, password, userid, token) {
        this.setUsername(username);
        this.setPassword(password);
        this.setUserId(userid);
        this.setToken(token);
        this.events.publish('user:login');
        this.loggedIn = true;
    }

    logout(){
        this.username = "";
        this.userid = "";
        this.token = "";
        this.password = "";
        this.events.publish('user:logout');
        this.loggedIn = false;
    } 

    hasFavorite(sessionName) {
        return (this._favorites.indexOf(sessionName) > -1);
    }

    addFavorite(sessionName) {
        this._favorites.push(sessionName);
    }

    removeFavorite(sessionName) {
        let index = this._favorites.indexOf(sessionName);
        if (index > -1) {
            this._favorites.splice(index, 1);
        }
    }

    getLoggedIn() {
        return this.loggedIn;
    }

    setLoggedIn(loggedin){
        this.loggedIn = loggedin;
    }         

    getUserId(){
        return this.userid;
    } 

    setUserId(uid){
        this.userid = uid;
    }  

    getToken(){
        return this.token;
    } 

    setToken(token){
        this.token = token;
    }  

    getUsername(){
        return this.username;
    } 

    setUsername(uname){
        this.username = uname;
    }      

    getPassword(){
        return this.password;
    } 

    setPassword(pwd){
        this.password = pwd;
    }         
}