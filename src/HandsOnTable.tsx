import { Component, ReactNode, createElement } from "react";
import { hot } from "react-hot-loader/root";
import App from "./appcode/index";
import { HandsOnTableContainerProps } from "../typings/HandsOnTableProps";
import "./ui/HandsOnTable.css";

class HandsOnTable extends Component<HandsOnTableContainerProps> {
    render(): ReactNode {
        console.log("3: Datsource: ", this.props.dataSource);
        const data: any[][] = [];
        this.props.dataSource &&
            this.props.dataSource.items &&
            this.props.dataSource.items.forEach(item => {
                const row = [
                    this.props.EcoID.get(item).displayValue,
                    this.props.Brand.get(item).displayValue,
                    this.props.Model.get(item).displayValue,
                    this.props.Model_Name.get(item).displayValue,
                    this.props.ecoGrade.get(item).displayValue,
                    this.props.Carrier.get(item).displayValue,
                    this.props.Added.get(item).displayValue,
                    this.props.MaximumQuantity.get(item).displayValue,
                    this.props.TargetPrice.get(item).displayValue,
                    this.props.BidAmount.get(item).displayValue,
                    this.props.BidQuantity.get(item).displayValue,
                    this.props.User.get(item).displayValue,
                    this.props.Code.get(item).displayValue,
                    this.props.CompanyName.get(item).displayValue,
                    this.props.BuyerCodeType.get(item).displayValue,
                    this.props.Data_Wipe_Quantity.get(item).displayValue,
                    this.props.BidRound.get(item).displayValue,
                    this.props.previousRoundBidAmount.get(item).displayValue,
                    this.props.previousRoundBidQuantity.get(item).displayValue
                ];
                data.push(row);
            });
        return <App entityData={data} />;
    }
}

export default hot(HandsOnTable);
