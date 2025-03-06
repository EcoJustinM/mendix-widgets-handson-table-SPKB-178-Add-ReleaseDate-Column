import { Component, ReactNode, createElement } from "react";
import { data } from "./appcode/constants";
import App from "./appcode/index";


import { HandsOnTablePreviewProps } from "../typings/HandsOnTableProps";

export class preview extends Component<HandsOnTablePreviewProps> {
    render() : ReactNode {
        return <App entityData={data}/>;
    } 
}

export function getPreviewCss(): string {
    return require("./ui/HandsOnTable.css");
}
