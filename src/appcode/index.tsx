import { Component, ReactNode, createElement, createRef } from "react";
import { HotTable, HotColumn, HotTableClass } from "@handsontable/react";
import { addClassesToRows, alignHeaders } from "./hooksCallbacks";
import { CellChange } from "handsontable/common";
import "handsontable/dist/handsontable.min.css";

import "./styles.css";
import { DetailedSettings } from "handsontable/plugins/nestedHeaders";
import Core from "handsontable/core";
import { dataRowToChangesArray } from "handsontable/helpers";

declare var mx: any;

interface AppProps {
  entityData: any[][];
}

class App extends Component<AppProps> {
  private hotTableRef = createRef<HotTableClass>();
  host = window.location.host;
  round = 0;
  print = false;
  colspanYourBid = 2;
  colCarryover: DetailedSettings= {label: '', colspan: 1};

  detailedSettings: DetailedSettings = {label: '<div></div>', colspan: 4}

  

  printMessage = (message: string) => {
    if (this.print == true) {
      console.log('LOGGING: ' + message);
    }
  }
  onBeforeChange = (changes: any, source: any) => {
    // col[9] = Price
    // col[10] = Quantity
    this.printMessage('onBeforeChange event');
    
    if (source === "edit" || source === 'CopyPaste.paste' || source === 'Autofill.fill') {
      return changes.map((change: any) => {
        const [row, col, oldValue, newValue] = change;

        const physicalRow = this.hotTableRef.current!.hotInstance?.toPhysicalRow(row)!;
        const existingPriceValue = this.props.entityData[row][9+8];  //pull the previous price value
        console.log("round: ", this.round," existingPriceValue: ", existingPriceValue);
        console.log("Row: ", row, " PhysicalRow: ", physicalRow);
        if (col === 10 || col === 9) {
 

          if (this.round == 0 || this.round == 1 || existingPriceValue == 0) {
            
             console.log("round 1: newValue: ", newValue, " oldValue: ", oldValue);
             if(newValue < 0){
              console.log('change round 1: < 0: ', change);
              
              change[3] = '';
              console.log('change round 1: change = ', change);
              
              return change;
            }

            if (newValue === "" || newValue === null) {
              change[3] = '';
               console.log('change round 1: A: ', change);
              return change;
            } else if (newValue === -1 || newValue == -1 || newValue == "-1") {
              change[3] = '';
               console.log('change round 1: B: ', change);
              return change
            } else {
              const numericValue = parseFloat(newValue);
              if (!isNaN(numericValue)) {
                const roundedValue =
                  col === 10
                    ? Math.round(numericValue)
                    : parseFloat(numericValue.toFixed(2));
                change[3] = roundedValue;
              } else {
                change[3] = oldValue;
              }
            }
          } else {
            const existingBidValue = this.props.entityData[physicalRow][9+8]; //const existingBidValue = this.props.entityData[row][col+8];
            console.log("existingBidValue: ", newValue, " oldValue: ", oldValue);
            
            console.log("round 2 or 3: newValue: ", newValue, " oldValue: ", oldValue);
            if(newValue <= 0){
              console.log('change round 2 or 3: < 0: ', change);
              console.log('change round 2 or 3: existingBidValue = ', existingBidValue);
              if(existingBidValue == -1 || existingBidValue === -1 || existingBidValue == '' || newValue == -1 || newValue == -1 || newValue == ''){
                change[3] = '';
              }
              else{
                change[3] = existingBidValue;
              }
              console.log('change round 2 or 3: change = ', change);
              
              return change;
            }

            if (col === 10 && parseFloat(newValue) > 0 && (existingBidValue === "" || existingBidValue == "" || existingBidValue === -1 || existingBidValue == -1 || existingBidValue == "-1")) {
              
              if(existingBidValue == -1 || existingBidValue === -1){
                console.log("change3: ");
                change[3] = '';
              }else{
                console.log("change3: " + existingBidValue);
                change[3] = existingBidValue;
              }
              console.log('change round 2 or 3: A: ', change);
              return change;
            }
            else if (col === 10 && (newValue === "" || newValue === null)) {
              // Allow removing the quantity cap in column 9
              change[3] = '';
              console.log('change round 2 or 3: B: ', change);
              return change;
            } else if (parseFloat(newValue) < parseFloat(existingBidValue)) {
              // Prevent lowering the value in columns 8 or 9
              console.log('change round 2 or 3: 9 and blank or null : ', change);
              change[3] = existingBidValue;
              return change;
            } else if (col === 9 && (newValue === "" || newValue === null)) {
              // Prevent removing the value in column 8
              change[3] = existingBidValue;
              console.log('change round 2 or 3: 9 and blank or null : ', change);
              return change;
            }

 
          }
        }
        this.printMessage('return change: ' + change);
        return change;
      });
    }
    this.updateRowInfo();
  }

  onAfterChange = (changes: CellChange[] | null) => {
    this.printMessage('onAfterChange: '+changes);
    if (changes) {
      const changesPayload = changes.map((change) => {
        const row = change[0];
        const rowData = this.hotTableRef.current?.hotInstance?.getDataAtRow(row);
        if (rowData) {
           console.log('rowData', rowData);
           console.log('rowData[10]', rowData[10]);
          if (rowData[10] === '' || rowData === null) {
             console.log('rowData[10] is blank', rowData[10]);
            rowData[10] = -1
          }
          return {
            EcoID: Number(rowData[0]),
            ecoGrade: rowData[4],
            BidAmount: Number(rowData[9]),
            BidQuantity: Number(rowData[10]),
            User: rowData[11],
            Code: rowData[12],
            CompanyName: rowData[13]
          };
        }
        return null;
      }).filter((change) => change !== null); // Filter out any null values

      this.sendChangeToMendix(changesPayload);
    }
    this.updateRowInfo();
  };

  setCells = (row: any, col: any, prop: any) => {
    this.printMessage('setCells');

    const cellprops: any = {};
    cellprops.className = "custom-cells";
    if (col === 9 || col === 10) {
      cellprops.className += " custom-bid-cells centered-cells";
    }
    if (col === 7 || col === 8) {
      cellprops.className += " centered-cells htCenter";
    }
    if (col === 32323) {
      console.log(row, prop);
    }
    return cellprops;
  }

  componentDidMount() {
    this.printMessage('componentDidMount');
    this.attachEventHandlers();
    this.updateRowInfo();
  }

  handleFilterInputKeyDown = (event: KeyboardEvent) => {
    this.printMessage('handleFilterInputKeyDown');
    this.updateRowInfo();
    if (event.key === ' ') {
      console.log('spacebar', event.key);
      event.stopPropagation();
    }
  }

  attachEventHandlers = () => {
    this.printMessage('attachEventHandlers');
    const hotInstance = this.hotTableRef.current?.hotInstance;
    if (hotInstance) {
      hotInstance.addHook('afterRender', () => {
        const filterInputs = document.querySelectorAll('.htUIInput input');
        console.log('query selectors ', filterInputs);
        filterInputs.forEach(input => {
          console.log('keydown, ', this.handleFilterInputKeyDown);
          input.addEventListener('keydown', this.handleFilterInputKeyDown);
        });
        this.updateRowInfo();  // try moving this 
      });
    }
  }

  updateRowInfo = () => { 
    //this.printMessage('updateRowInfo');
    const hotInstance = this.hotTableRef.current?.hotInstance;
    if (hotInstance) {
      const totalRows = this.props.entityData.length;
      const formattedTotalRows = totalRows.toLocaleString();
      const visibleRows = hotInstance.countRows();
      
      // console.log('LOG: countRows:', hotInstance.countRows());
      // console.log('LOG: countVisibleRows', hotInstance.countVisibleRows());
      // console.log('LOG: countSourceRows', hotInstance.countSourceRows);
      // console.log('LOG: getSelectedRange().length', hotInstance.getSelectedRange()?.length);
      

      const formattedVisibleRows = visibleRows.toLocaleString();
      const bidderNote = document.getElementsByClassName('bidderNote');
      const rowInfoElement = document.getElementsByClassName('rowInfo');
      if (rowInfoElement && rowInfoElement.length > 0) {
        if (this.round > 1) {
          // this.printMessage('bidderNote ' + bidderNote);
          // this.printMessage('rowInfoElement ' + rowInfoElement);
          // this.printMessage('formattedVisibleRows ' + formattedVisibleRows);
          // this.printMessage('this.round ' + this.round);
          if (bidderNote && bidderNote.length > 0) {
            if (bidderNote[1]) {
              //Note: In Round2, you can only increase bids and qty caps. Bids and quantity caps that are decreased will NOT be updated
              bidderNote[1].innerHTML = `<span class="round2-bidder-note">Note: In Round ${this.round}, you can only increase bids and qty caps. Bids and quantity caps that are decreased will NOT be updated.</span>`;
            } else {
              bidderNote[0].innerHTML = `<span class="round2-bidder-note">Note: In Round ${this.round}, you can only increase bids and qty caps. Bids and quantity caps that are decreased will NOT be updated.</span>`;
            }
          }
          if (rowInfoElement && rowInfoElement.length > 0) {
            //this.printMessage('updateRowInfo rowInfoElement 2 ' + rowInfoElement);
            if (rowInfoElement[1]) {
              rowInfoElement[1].innerHTML = `<span style="position: relative;top: 33px;left: -827px;Z-INDEX: 900;font-weight: 500;">Showing <span style="color:#14AC36;">${formattedVisibleRows}</span> out of ${formattedTotalRows} rows</span>`;
            } else {
              rowInfoElement[0].innerHTML = `<span style="position: relative;top: 33px;left: -827px;Z-INDEX: 900;font-weight: 500;">Showing <span style="color:#14AC36;">${formattedVisibleRows}</span> out of ${formattedTotalRows} rows</span>`;
            }
          }
        }
        else if (this.round < 2) {
          if (rowInfoElement && rowInfoElement.length > 0) {
            //this.printMessage('updateRowInfo rowInfoElement 2 ' + rowInfoElement);
            if (rowInfoElement[1]) {
              rowInfoElement[1].innerHTML = `<span style="position: relative;top: 29px;left: 0;Z-INDEX: 900;font-weight: 500;">Showing <span style="color:#14AC36;">${formattedVisibleRows}</span> out of ${formattedTotalRows} rows</span>`;
            } else {
              rowInfoElement[0].innerHTML = `<span style="position: relative;top: 29px;left: 0;Z-INDEX: 900;font-weight: 500;">Showing <span style="color:#14AC36;">${formattedVisibleRows}</span> out of ${formattedTotalRows} rows</span>`;
            }
          } else {
            //this.printMessage('updateRowInfo rowInfoElement not found - 2');
          }     
        } else {
          //this.printMessage('updateRowInfo rowInfoElement not found - 2 and Round is' + this.round);
        }
      }
      else {
        this.printMessage('updateRowInfo rowInfoElement not found');
      }
    }
  }

  sendChangeToMendix = (changesPayload: any[]) => {
    const jsonPayload = JSON.stringify(changesPayload);
    let baseUrl = `${window.location.protocol}//${this.host}/rest/biddata/v1/bidData_Helper/update`;
    const csrfToken = mx.session.getConfig("csrftoken");
    fetch(baseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Csrf-Token": csrfToken
      },
      credentials: 'include',
      body: jsonPayload
    })
      .then(response => {
        return response.text();
      })
      .then(text => {
        if (text) {
          return JSON.parse(text);
        }
        return {};
      });
      this.updateRowInfo();
  };

  render(): ReactNode {
    this.printMessage('render');
    this.updateRowInfo();
    // this checks for -1 and shows blank
    if (this.props && this.props.entityData.length > 0) {
      this.round = this.props.entityData[0][16];
      this.printMessage("Round: " + this.round);
    }
    if (this.round == 1) {
      this.colspanYourBid = 1;
      this.colCarryover = { label: "", colspan: 1 }
    }
    if (this.round < 1) {
      this.colspanYourBid = 2;
      this.colCarryover= { label: "", colspan: 0 };
    }

    for (let x = 0; x < this.props.entityData.length; x++) {
      let qty = this.props.entityData[x][10];
      if (qty == "-1" || qty == -1) {
        this.props.entityData[x][10] = '';
      }
      
      let dwCheck = this.props.entityData[x][14];
      this.printMessage('dwCheck: ' + dwCheck);
      if (dwCheck == "Data_Wipe") {
        let dwQty = this.props.entityData[x][15];
        this.printMessage('dwQty: ' + dwQty);
        if (dwQty == '') {
          dwQty = 0;
        }
        this.props.entityData[x][7] = dwQty;
      }
//["", "", "", "", "", "", "", "", { label: "Your Bid", colspan: 2 },"", "", "", "", "", "", ""],
    }
    return (
      <div>
        {
        this.round > 1 && (
          <div>
            <span className="bidderNote"></span>
            <span className="rowInfo"></span>
          </div>
        )}

        {this.round < 2 && (
          <span className="rowInfo"></span>
        )}
        <HotTable
          ref={this.hotTableRef}
          data={this.props.entityData}
          height={650}
          width={1556}
          colWidths={[115, 100, 150, 350, 130, 110, 110, 115, 130, 110, 115, 100, 100, 100, 100, 100, 100]}
          nestedHeaders={[
            [this.detailedSettings, "", "", "", "", "",   { label: "Your Bid", colspan: this.colspanYourBid }, this.colCarryover,"", "", "", "", "", ""],
            [
              "Product Id",
              "Brand",
              "Model",
              "Model Name",
              "Grade",
              "Carrier",
              "Added",
              "Avail. Qty",
              "Target Price",
              "Price",
              "Qty. Cap",
              "User",
              "Code",
              "CompanyName",
              "BuyerCodeType",
              "Data_Wipe_Quantity",
              "BidRound"
            ]
          ]}
          dropdownMenu={[
            'filter_by_condition',
            'filter_by_value',
            'filter_action_bar'
          ]}
          hiddenColumns={{
            columns: [11, 12, 13, 14, 15, 16],
            indicators: false,
          }}
          cells={this.setCells}
          multiColumnSorting={true}
          filters={true}
          rowHeaders={false}
          autoWrapCol={true}
          autoWrapRow={true}
          afterGetColHeader={alignHeaders}
          beforeRenderer={addClassesToRows}
          manualRowMove={true}
          contextMenu={false}
          columnSorting={true}
          renderAllRows={false}
          viewportRowRenderingOffset={10}
          afterChange={this.onAfterChange}
          id="ecoATMTable"
          licenseKey="c45a6-e19ed-8aed4-5da13-b8c22"
          beforeChange={this.onBeforeChange}>
          <HotColumn data={0} editor={false} readOnly={true} type="numeric"/>
          <HotColumn data={1} editor={false} readOnly={true} type="text"/>
          <HotColumn data={2} editor={false} readOnly={true} type="text"/>
          <HotColumn data={3} editor={false} readOnly={true} type="text"/>
          <HotColumn data={4} editor={false} readOnly={true} type="text"/>
          <HotColumn data={5} editor={false} readOnly={true} type="text"/>
          <HotColumn data={6} editor={"date"} type={"date"} readOnly={true} dateFormat={"MM/DD/YYYY"} correctFormat={true} />
          <HotColumn data={7} type="numeric" numericFormat={{ pattern: "0,0", culture: "en-US" }} readOnly={true} className={"htCenter"} />
          <HotColumn data={8} type="numeric" numericFormat={{ pattern: "$0,0.00", culture: "en-US" }} readOnly={true} className={"htCenter"} />
          <HotColumn data={9} type="numeric" numericFormat={{ pattern: "$0,0.00", culture: "en-US" }} className={"htCenter"} />
          <HotColumn data={10} type="numeric" numericFormat={{ pattern: "0,0", culture: "en-US" }} className={"htCenter"} />
          <HotColumn data={11} editor={false} readOnly={true} type="text"/>
          <HotColumn data={12} editor={false} readOnly={true} type="text"/>
          <HotColumn data={13} editor={false} readOnly={true} type="text"/>
          <HotColumn data={14} editor={false} readOnly={true} type="text"/>
          <HotColumn data={15} editor={false} readOnly={true} type="numeric"/>
          <HotColumn data={16} editor={false} readOnly={true} type="numeric"/>
        </HotTable>
      </div>
    );
  }
};

export default App;