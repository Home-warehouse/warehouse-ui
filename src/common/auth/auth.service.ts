
import { Injectable } from '@angular/core';
import jwtDecode from 'jwt-decode';
import { hwAPI } from '../api/api';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  accessToken: string | null = null;

  constructor(
    private hwAPI: hwAPI,
  ) { }

  updateToken = async() => {
    const response = await this.hwAPI.fetch({
      query: `query updateToken {
        refreshToken{
         accessToken
       }
     }`
    })
    if(response.data?.data?.refreshToken?.accessToken){
      localStorage.setItem("accessToken", response.data.data.refreshToken.accessToken)
    }
  }

  isLoggedIn(): boolean {
    this.accessToken = localStorage.getItem("accessToken")
    if(this.accessToken){
      try {
        const token: any = jwtDecode(this.accessToken)
        if(new Date(token.exp * 1000) < new Date()){
          // Token is outdated
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
