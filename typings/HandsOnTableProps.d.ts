/**
 * This file was generated from HandsOnTable.xml
 * WARNING: All changes made to this file will be overwritten
 * @author Mendix Widgets Framework Team
 */
import { CSSProperties } from "react";
import { ListValue, ListAttributeValue } from "mendix";
import { Big } from "big.js";

export interface HandsOnTableContainerProps {
    name: string;
    class: string;
    style?: CSSProperties;
    tabIndex?: number;
    dataSource: ListValue;
    EcoID: ListAttributeValue<Big>;
    Brand: ListAttributeValue<string>;
    Model: ListAttributeValue<string>;
    Model_Name: ListAttributeValue<string>;
    ecoGrade: ListAttributeValue<string>;
    Carrier: ListAttributeValue<string>;
    Added: ListAttributeValue<Date>;
    MaximumQuantity: ListAttributeValue<Big>;
    TargetPrice: ListAttributeValue<Big>;
    BidAmount: ListAttributeValue<Big>;
    BidQuantity: ListAttributeValue<Big>;
    User: ListAttributeValue<string>;
    Code: ListAttributeValue<string>;
    CompanyName: ListAttributeValue<string>;
    BuyerCodeType: ListAttributeValue<string>;
    Data_Wipe_Quantity: ListAttributeValue<Big>;
    BidRound: ListAttributeValue<Big>;
    previousRoundBidAmount: ListAttributeValue<Big>;
    previousRoundBidQuantity: ListAttributeValue<Big>;
}

export interface HandsOnTablePreviewProps {
    /**
     * @deprecated Deprecated since version 9.18.0. Please use class property instead.
     */
    className: string;
    class: string;
    style: string;
    styleObject?: CSSProperties;
    readOnly: boolean;
    dataSource: {} | { caption: string } | { type: string } | null;
    EcoID: string;
    Brand: string;
    Model: string;
    Model_Name: string;
    ecoGrade: string;
    Carrier: string;
    Added: string;
    MaximumQuantity: string;
    TargetPrice: string;
    BidAmount: string;
    BidQuantity: string;
    User: string;
    Code: string;
    CompanyName: string;
    BuyerCodeType: string;
    Data_Wipe_Quantity: string;
    BidRound: string;
    previousRoundBidAmount: string;
    previousRoundBidQuantity: string;
}
