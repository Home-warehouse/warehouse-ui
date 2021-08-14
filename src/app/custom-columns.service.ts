import { hwAPI } from 'src/common/api/api';
import { Injectable } from '@angular/core';
import { DataObject } from 'src/common/interfaces/request.interface';

@Injectable({
  providedIn: 'root'
})
export class CustomColumnsService {
  customColumns: any[] = [];
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
              name
              dataType
              elementsAllowed
              values
            }
          }
        }
      }`
    })
    this.customColumns = response.data.data.customColumnsList.edges.map((parentNode: any)=>{
      return {node: {...parentNode.node, show: true}}
    }).sort((a:any, b:any) => a.node.index - b.node.index)
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

  updateCustomColumnsIndexes = async() => {
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
    console.log(customColumnDetails)
    // Create product
    const responseCustomColumn = await this.hwAPI.fetch({
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
