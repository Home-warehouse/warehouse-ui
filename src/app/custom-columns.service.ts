import { hwAPI } from 'src/common/api/api';
import { Injectable } from '@angular/core';

type elementsAllowedType = | "PRODUCTS" | "LOCATIONS";

export enum dataTypesEnum {
  TEXT = 'TEXT',
  NUMBER = 'NUMBER',
  DATE = 'DATE',
  SELECT = 'SELECT'
}

export interface customColumn {
  show?: boolean
  id: string
  index: number
  customColumnName: string
  dataType: dataTypesEnum
  elementsAllowed: elementsAllowedType[]
  values?: string[]
}

export interface customColumnParentNode {
  node: customColumn
}


interface customColumnValue {
  id: string
  customColumn: customColumn
  value: string
}

export interface customColumnValueParentNode {
  node: customColumnValue
}


@Injectable({
  providedIn: 'root'
})
export class CustomColumnsService {
  customColumns: customColumnParentNode[] = [];
  constructor(
    private hwAPI: hwAPI
  ) { }

  queryCustomColumns = async() => {
    const response = await this.hwAPI.fetch({
      query: `
      query listCustomColumns{
        customColumnsList{
          edges{
            node{
              id
              index
              customColumnName
              dataType
              elementsAllowed
              values
            }
          }
        }
      }`
    })
    this.customColumns = response.data.data.customColumnsList.edges.map((parentNode: customColumnParentNode)=>{
      return {node: {...parentNode.node, show: true}}
    }).sort((a:any, b:any) => a.node.index - b.node.index)
  }



  findCustomColumnValue = (customId: string, customColumnsValues: customColumnValueParentNode[]) => {
    const value =  customColumnsValues.find((parentNode: customColumnValueParentNode)=> parentNode.node.customColumn.id === customId)?.node.value
    return value
  }

  findCustomColumnModel = (selectedElement: any, customId: string) => {
    if(selectedElement.customColumns){
      if(selectedElement.customColumns.edges){
        const value = selectedElement.customColumns.edges.find((parentNode: customColumnValueParentNode)=>{
          return parentNode.node.customColumn.id === customId
        })
        if(value){
          return value.node.value
        }
      }
    }
    return ""
  }

  updateCustomColumnsIndexesAPI = async() => {
    this.customColumns = this.customColumns.map((parentNode: any, index: number)=>{
      return {node: {...parentNode.node, index}}
    })

    const cc_to_fetch = this.customColumns.map((parentNode: any)=>{
      return parentNode.node
    })

    const responseUpdate = await this.hwAPI.fetch({
      query: `
        mutation modCustomColumn($input: [CustomColumnInput]!){
          modifyCustomColumn(input: $input){
            modified
          }
        }
        `,
        variables: {
          input: cc_to_fetch.map(({show, ...others})=> others)
        }
    })
  }


  updateCustomColumnModel = async(selectedElement: any, columnModelNode?: customColumn, event?: any) => {
    if(!selectedElement.customColumns){
      selectedElement.customColumns.edges = [
        {node:{
          customColumn: {
            id: columnModelNode?.id,
            customColumnName: columnModelNode?.customColumnName
          },
          value: event
        }}
      ]
    }
    const value = selectedElement.customColumns.edges.find((parentNode:any)=>{
      return parentNode.node.customColumn.id === columnModelNode?.id
    })
    if(value){
      value.node.value = event
    } else {
      selectedElement.customColumns.edges.push({node:{
        customColumn: {
          id: columnModelNode?.id,
          customColumnName: columnModelNode?.customColumnName
        },
        value: event
      }})
    }
    return selectedElement
  }


  saveNewCustomColumnAPI = async(selectedElement: any, customColumnDetails: customColumn) => {
    // Create product
    const responseCustomColumn = await this.hwAPI.fetch({
      query: `
      mutation createCustomColumn($customColumnDetails: CreatingCustomColumnInput!){
        createCustomColumn(customColumnDetails: $customColumnDetails){
          customColumn{
            id
          }
        }
      }
      `,
      variables: {
        customColumnDetails
      }
    })
    // Update ID
    selectedElement.id = responseCustomColumn.data.data.createCustomColumn.customColumn.id
    return {id: responseCustomColumn.data.data.createCustomColumn.customColumn.id, selectedElement}
  }


}
