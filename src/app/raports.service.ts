import { Injectable } from '@angular/core';
import { apiFetch } from 'src/common/api/api';

@Injectable({
  providedIn: 'root'
})
export class RaportsService {
  raportsList: any = [];

  constructor() { }
  queryRaportsList = async() => {
    const response = await apiFetch({
      query: `
      query raport_list {
        raportsList{
          edges{
            node{
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
              raportName
              description
              showCustomColumns{
                edges{
                  node{
                    id
                    name
                  }
                }
              }
              shortResults
            }
          }
        }
      }`
      })
      return response
  }

  queryFilteredProductsList = async(raportsListLocal: any) => {
    this.raportsList=[]
    const parsedRaportInstructions = raportsListLocal.edges.map((parentNode:any)=>{
      return {
        name: parentNode.node.raportName,
        showCustomColumns: parentNode.node.showCustomColumns.edges.map((parentShowCustomColumnNode:any)=>{
          return {...parentShowCustomColumnNode.node}
      })
    }})
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

    raportsListParsed.forEach(async(raport: any, index:number) => {
      const result = await apiFetch({
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
                    name
                  }
                }
              }
            }
          }
        }
        `,
        variables: {
          showCustomColumns: raportsListParsed[index].showCustomColumns,
          sortBy: raportsListParsed[index].sortBy,
          filterBy: raportsListParsed[index].filterBy,
          limit: raportsListParsed[index].limit
        }
      })
      raport = {
          raportName: parsedRaportInstructions[index].name,
          customColumns: parsedRaportInstructions[index].showCustomColumns,
          productsList: result.data.data.filterSortProducts
      }

      this.raportsList.push(raport)
    });
    console.log(this.raportsList)
  }
}
