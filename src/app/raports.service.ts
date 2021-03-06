import { Injectable } from '@angular/core';
import { hwAPI } from 'src/common/api/api';
import { customColumn, customColumnParentNode } from './custom-columns.service';


interface filterBy {
  node: {
    customColumn: customColumn
    comparison: string
    value: string
  }
}

interface sortBy {
  node: {
    id: string
    customColumn: customColumn
    comparison: string
    value: string
  }
}

interface raport {
  id: string
  raportName: string
  description: string
  showCustomColumns: {
    edges: customColumnParentNode[]
  }
  sortBy: sortBy
  filterBy: {
    edges: filterBy[]
  }
  shortResults: number
  productsList?: any
  customColumns?: any
}

export interface raportParentNode {
  node: raport
}

interface raportsList {
  edges: raportParentNode[]
}



@Injectable({
  providedIn: 'root'
})
export class RaportsService {
  raportsList: raport[] = [];

  constructor(
    private hwAPI: hwAPI
  ) { }

  queryRaportsList = async(id?: string | null) => {
    const response = await this.hwAPI.fetch({
      query: `
      query raport_list {
        raportsList${id ? '(id_Exact:"'+id+'")' : ""}{
          edges{
            node{
              id
              raportName
              description
              shortResults
              sortBy{
                value
                customColumn{
                  id
                }
              }
              filterBy{
                edges{
                  node{
                    customColumn{
                      id
                    }
                    comparison
                    value
                  }
                }
              }
              showCustomColumns{
                edges{
                  node{
                    id
                    customColumnName
                  }
                }
              }
            }
          }
        }
      }`
      })
      return response
  }

  parseRaports = (raportsListLocal: raportsList) => {
    const raportsListParsed = raportsListLocal.edges.map((parentNode:any)=>{
      return {
        showCustomColumns: parentNode.node.showCustomColumns.edges.map((parentShowCustomColumnNode:any)=>{
          return parentShowCustomColumnNode.node.id
        }),
        sortBy: {
          customColumn: parentNode.node.sortBy.customColumn.id,
          value: parentNode.node.sortBy.value
        },
        filterBy: parentNode.node.filterBy.edges.map((parentFilterNode:any)=>{
          return {
            customColumn: parentFilterNode.node.customColumn.id,
            comparison: parentFilterNode.node.comparison,
            value: parentFilterNode.node.value
          }
        }),
        limit: parentNode.node.shortResults
      }
    }
  )
  return raportsListParsed
  }

  queryFilteredProductsList = async(raportsListLocal: raportsList, noLimit?: boolean) => {
    this.raportsList = []
    const parsedRaportInstructions = raportsListLocal.edges.map((parentNode:any)=>{
      return {
        id: parentNode.node.id,
        name: parentNode.node.raportName,
        showCustomColumns: parentNode.node.showCustomColumns.edges.map((parentShowCustomColumnNode:any)=>{
          return {...parentShowCustomColumnNode.node}
      })
    }})

    let raportsListParsed = this.parseRaports(raportsListLocal)

    await raportsListParsed.forEach(async(raport: any, index:number) => {
      let requestVariables: any = {
        showCustomColumns: raportsListParsed[index].showCustomColumns,
        sortBy: raportsListParsed[index].sortBy,
        filterBy: raportsListParsed[index].filterBy,
      }
      if(!noLimit){
        requestVariables.limit = raportsListParsed[index].limit
      }


      const result = await this.hwAPI.fetch({
        query: `query filter_prods($showCustomColumns: [String]!, $sortBy: SortRaportInput!, $filterBy: [FilterRaportInput]!, $limit: Int) {
          filterSortProducts(
            showCustomColumns: $showCustomColumns
            sortBy: $sortBy
            filterBy: $filterBy,
            limit: $limit
          ){
            productName
            customColumns{
              edges{
                node{
                  value
                   customColumn{
                    id
                    customColumnName
                  }
                }
              }
            }
          }
        }
        `,
        variables: requestVariables
      })
      raport = {
          id: parsedRaportInstructions[index].id,
          raportName: parsedRaportInstructions[index].name,
          showCustomColumns: parsedRaportInstructions[index].showCustomColumns,
          productsList: result.data.data.filterSortProducts
      }

      this.raportsList.push(raport)
    });
  }

  deleteRaport = async(id:string) => {
    const result = await this.hwAPI.fetch({
      query: `mutation delete_raport($id: ID!) {
        deleteRaport(id: $id){
          deleted
        }
      }
      `,
      variables: {
        id
      }
    })
    return result
  }

}
