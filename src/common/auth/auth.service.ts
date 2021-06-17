
import { Injectable } from '@angular/core';
import jwtDecode from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  accessToken: string | null = null;

  constructor() { }

  isLoggedIn(): boolean {
    this.accessToken = localStorage.getItem("accessToken")
    if(this.accessToken){
      try {
        const token: any = jwtDecode(this.accessToken)
        if(new Date(token.exp * 1000) < new Date()){
          console.log("Outdated")
          return false
        }
        return true
      } catch (error) {
        console.log(error)
        return false
      }
    }
    return false
  }
}
