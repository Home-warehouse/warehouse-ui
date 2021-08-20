import { Injectable } from '@angular/core';
import { hwAPI } from 'src/common/api/api';

export interface User {
  email:      string;
  firstName:  string;
  lastName:   string;
  id:         string;
  newAccount: boolean;
  rank:       string;
}

export interface userParentNode {
  node: User
}

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  usersList: userParentNode[] = [];

  constructor(
    private hwAPI: hwAPI
  ) { }

  queryUsersList = async() => {
    const response = await this.hwAPI.fetch({
      query: `query Accounts_list{
        accountsList{
          edges{
            node{
              id
              email
              firstName
              lastName
              newAccount
              rank
            }
          }
        }
      }`
      })
      return response
  }
}
