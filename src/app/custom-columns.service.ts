import { apiFetch } from 'src/common/api/api';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CustomColumnsService {
  customColumns!: any[];


  queryCustomColumns = async() => {
    const response = await apiFetch({
      query: `
      query listCustomColumns{
        customColumnsList{
          edges{
            node{
              id
              name
              dataType
              elementsAllowed
            }
          }
        }
      }`
    })
    this.customColumns = response.data.data.customColumnsList.edges.map((parentNode: any)=>{
      return {node: {...parentNode.node, show: true}}
    })
  }



  findCustomColumnValue = (customId: string, customValues: any) => {
    const value: any =  customValues.find((parentNode: any)=> {
        if (parentNode.node.customColumn.id === customId){
          return parentNode.node.value
        }
    })
    if(value){
      return value.node.value
    } else {
      return null
    }
  }

  findCustomColumnModel = (selectedElement: any, customId: string) => {
    if(selectedElement.customColumns){
      if(selectedElement.customColumns.edges){
        const value = selectedElement.customColumns.edges.find((parentNode:any)=>{
          return parentNode.node.customColumn.id === customId
        })
        if(value){
          return value.node.value
        }
      }
    }
    return ""
  }



  updateCustomColumnModel = async(selectedElement: any, columnModelNode?: any, event?: any) => {
    if(!selectedElement.customColumns){
      selectedElement.customColumns.edges = [
        {node:{
          customColumn: {
            id: columnModelNode.id,
            name: columnModelNode.name
          },
          value: event
        }}
      ]
    }
    const value = selectedElement.customColumns.edges.find((parentNode:any)=>{
      return parentNode.node.customColumn.id === columnModelNode.id
    })
    if(value){
      value.node.value = event
    } else {
      selectedElement.customColumns.edges.push({node:{
        customColumn: {
          id: columnModelNode.id,
          name: columnModelNode.name
        },
        value: event
      }})
    }
    return selectedElement
  }



  saveNewCustomColumnAPI = async(selectedElement: any, customColumnDetails: any) => {
    // Create product
    const responseCustomColumn = await apiFetch({
      query: `
      mutation createCustomColumn($customColumnDetails: CustomColumnInput!){
        createCustomColumn(customColumnDetails: $customColumnDetails){
          customColumn{
            id
          }
        }
      }
      `,
      variables: {
        customColumnDetails: customColumnDetails
      }
    })
    // Update ID
    selectedElement.id = responseCustomColumn.data.data.createCustomColumn.customColumn.id
    return {id: responseCustomColumn.data.data.createCustomColumn.customColumn.id, selectedElement}
  }


}
