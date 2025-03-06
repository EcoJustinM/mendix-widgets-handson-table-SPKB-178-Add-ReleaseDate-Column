import { Component, ReactNode, createElement } from "react";

import { ListValue, ListAttributeValue } from "mendix";

import { Big } from "big.js";


export interface HandsOnTableProps {

  dataSource: ListValue | null;
  EcoID: ListAttributeValue<Big>;
  Brand: ListAttributeValue<string>;
  Model: ListAttributeValue<string>;
  Model_Name: ListAttributeValue<string>;
  ecoGrade: ListAttributeValue<string>;
  Carrier: ListAttributeValue<string>;
  Added: ListAttributeValue<string>;
  MaximumQuantity: ListAttributeValue<string>;
  TargetPrice: ListAttributeValue<string>;
  BidQuantity: ListAttributeValue<Big>;
  BidAmount: ListAttributeValue<Big>;
  User: ListAttributeValue<string>;
  Code: ListAttributeValue<string>;
  CompanyName: ListAttributeValue<string>;
  BuyerCodeType: ListAttributeValue<string>;
  Data_Wipe_Quantity: ListAttributeValue<string>;
  BidRound: ListAttributeValue<Big>;
  previousRoundBidAmount: ListAttributeValue<Big>;
  previousRoundBidQuantity: ListAttributeValue<Big>;
}


export class HandsOnTableRenderer extends Component<HandsOnTableProps> {
  render(): ReactNode {
    const entities = this.props.dataSource?.items;
    console.log("1: Datsource: ", this.props.dataSource);
    return (
      <ul>
        {this.props.dataSource && entities && entities.map((item) => (
          <li>
            <dl>
              <dt>ID (ecoid):</dt>
              <dd>{this.props.EcoID.get(item).displayValue}</dd>
              <dt>Brand:</dt>
              <dd>{this.props.Brand.get(item).displayValue}</dd>
              <dt>Model:</dt>
              <dd>{this.props.Model.get(item).displayValue}</dd>
              <dt>Model Name:</dt>
              <dd>{this.props.Model_Name.get(item).displayValue}</dd>
              <dt>Grade:</dt>
              <dd>{this.props.ecoGrade.get(item).displayValue}</dd>
              <dt>Carrier:</dt>
              <dd>{this.props.Carrier.get(item).displayValue}</dd>
              <dt>Added:</dt>
              <dd>{this.props.Added.get(item).displayValue}</dd>
              <dt>Max Qty:</dt>
              <dd>{this.props.MaximumQuantity.get(item).displayValue}</dd>
              <dt>Target Price:</dt>
              <dd>{this.props.TargetPrice.get(item).displayValue}</dd>
              <dt>Bid Price:</dt>
              <dd>{this.props.BidAmount.get(item).displayValue}</dd>
              <dt>Bid Qty:</dt>
              <dd>{this.props.BidQuantity.get(item).displayValue}</dd>
              <dt>User:</dt>
              <dd>{this.props.User.get(item).displayValue}</dd>
              <dt>Code:</dt>
              <dd>{this.props.Code.get(item).displayValue}</dd>
              <dt>CompanyName:</dt>
              <dd>{this.props.CompanyName.get(item).displayValue}</dd>
              <dt>BuyerCodeType:</dt>
              <dd>{this.props.BuyerCodeType.get(item).displayValue}</dd>
              <dt>Data_Wipe_Quantity:</dt>
              <dd>{this.props.Data_Wipe_Quantity.get(item).displayValue}</dd>
              <dt>BidRound:</dt>
              <dd>{this.props.BidRound.get(item).displayValue}</dd>
              <dt>Bid Price:</dt>
              <dd>{this.props.previousRoundBidAmount.get(item).displayValue}</dd>
              <dt>Bid Qty:</dt>
              <dd>{this.props.previousRoundBidQuantity.get(item).displayValue}</dd>
            </dl>
          </li>
        ))}
      </ul>);


  }
}