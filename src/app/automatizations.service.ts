import { Injectable } from '@angular/core';
import { hwAPI } from 'src/common/api/api';

@Injectable({
  providedIn: 'root'
})
export class AutomatizationsService {
  automatizations: any[] = [];

  constructor(
    private hwAPI: hwAPI
  ) { }

  queryAutomatizations = async() => {
    const response = await this.hwAPI.fetch({
      query: `
      query listAutomatizations{
        automatizationsList{
          edges{
            node{
              id
              automatizationName
              app
              config
              elementIntegrated{
                __typename
              }

            }
          }
        }
      }`
    })
    this.automatizations = response.data.data.automatizationsList.edges
  }

  deleteAutomatization = async(id: string) => {
    const response = await this.hwAPI.fetch({
      query: `
      mutation deleteAutomatization($id: ID!) {
        deleteAutomatization(id: $id){
          deleted
        }
      }`,
      variables: {id}
    })

    this.automatizations = this.automatizations.filter(el => {
      return el.node.id !== id
    })
  }
}
