import { Component, ReactNode, createElement, createRef } from "react";
import { HotTable, HotColumn, HotTableClass } from "@handsontable/react";
import { addClassesToRows, alignHeaders } from "./hooksCallbacks";
import { CellChange } from "handsontable/common";
import "handsontable/dist/handsontable.min.css";

import "./styles.css";

declare var mx: any;

interface AppProps {
  entityData: any[][];
}

class App extends Component<AppProps> {
  private hotTableRef = createRef<HotTableClass>();
  host = window.location.host;
  round = 0;

  onBeforeChange = (changes: any, source: any) => {
    // col[8] = Price
    // col[9] = Quantity

    if (source === "edit" || source === 'CopyPaste.paste') {
      return changes.map((change: any) => {
        const [row, col, oldValue, newValue] = change;
        // Check if the current round is greater than Round 1
        if (this.round > 1 && (col === 8 || col === 9)) {
          if (col === 9 && parseFloat(newValue) > 0 && (oldValue === "" || oldValue == "" || oldValue === -1 || oldValue == -1 || oldValue == "-1")){
            change[3] = oldValue;
            return change;
          }
          else if (col === 9 && (newValue === "" || newValue === null)) {
            // Allow removing the quantity cap in column 9
            change[3] = '';
            return change;
          } else if (parseFloat(newValue) < parseFloat(oldValue)) {
            // Prevent lowering the value in columns 8 or 9
            change[3] = oldValue;
            return change;
          } else if (col === 8 && (newValue === "" || newValue === null)) {
            // Prevent removing the value in column 8
            change[3] = oldValue;
            return change;
          }
        }
        // Handle the formatting for columns 8 and 9
        if (col === 9 || col === 8) {
          if (newValue === "" || newValue === null) {
            change[3] = '';
            return change;
          } else if (newValue === -1 || newValue == -1 || newValue == "-1") {
            change[3] = '';
            return change
          } else {
            const numericValue = parseFloat(newValue);
            if (!isNaN(numericValue)) {
              const roundedValue =
                col === 9
                  ? Math.round(numericValue)
                  : parseFloat(numericValue.toFixed(2));
              change[3] = roundedValue;
            } else {
              change[3] = oldValue;
            }
          }
        }
        return change;
      });
    }
  }

  onAfterChange = (changes: CellChange[] | null) => {
    if (changes) {
      const changesPayload = changes.map((change) => {
        const row = change[0];
        const rowData = this.hotTableRef.current?.hotInstance?.getDataAtRow(row);
        if (rowData) {
          // console.log('rowData', rowData);
          // console.log('rowData[9]', rowData[9]);
          if (rowData[9] === '' || rowData === null) {
            // console.log('rowData[9] is blank', rowData[9]);
            rowData[9] = -1
          }
          return {
            EcoID: Number(rowData[0]),
            ecoGrade: rowData[4],
            BidAmount: Number(rowData[8]),
            BidQuantity: Number(rowData[9]),
            User: rowData[10],
            Code: rowData[11],
            CompanyName: rowData[12]
          };
        }
        return null;
      }).filter((change) => change !== null); // Filter out any null values

      this.sendChangeToMendix(changesPayload);
    }
  };

  setCells = (row: any, col: any, prop: any) => {
    const cellprops: any = {};
    cellprops.className = "custom-cells";
    if (col === 8 || col === 9) {
      cellprops.className += " custom-bid-cells centered-cells";
    }
    if (col === 6 || col === 7) {
      cellprops.className += " centered-cells htCenter";
    }
    if (col === 32323) {
      console.log(row, prop);
    }
    return cellprops;
  }

  componentDidMount() {
    this.attachEventHandlers();
    this.updateRowInfo();
  }

  handleFilterInputKeyDown = (event: KeyboardEvent) => {
    if (event.key === ' ') {
      console.log('spacebar', event.key);
      event.stopPropagation();
    }

  }

  attachEventHandlers = () => {
    const hotInstance = this.hotTableRef.current?.hotInstance;
    if (hotInstance) {
      hotInstance.addHook('afterRender', () => {
        const filterInputs = document.querySelectorAll('.htUIInput input');
        console.log('query selectors ', filterInputs);
        filterInputs.forEach(input => {
          console.log('keydown, ', this.handleFilterInputKeyDown);
          input.addEventListener('keydown', this.handleFilterInputKeyDown);
        });
        this.updateRowInfo();
      });
    }
  }

  updateRowInfo = () => {
    const hotInstance = this.hotTableRef.current?.hotInstance;
    if (hotInstance) {
      const totalRows = this.props.entityData.length;
      const formattedTotalRows = totalRows.toLocaleString();
      const visibleRows = hotInstance.countRenderedRows();
      const formattedVisibleRows = visibleRows.toLocaleString();
      const rowInfoElement = document.getElementById('rowInfo');
      if (rowInfoElement) {
        rowInfoElement.innerHTML = `<span style="position: relative; top: 29px; left: 7px; Z-INDEX: 1000; font-weight: 500;">Showing <span style="color:#14AC36;">${formattedVisibleRows}</span> out of ${formattedTotalRows} rows</span>`;
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
  };

  render(): ReactNode {
    // this checks for -1 and shows blank
    if (this.props && this.props.entityData.length > 0) {
      this.round = this.props.entityData[0][15];
      console.log("Round: ", this.round);
    }

    for (let x = 0; x < this.props.entityData.length; x++) {
      let qty = this.props.entityData[x][9];
      if (qty == "-1" || qty == -1) {
        this.props.entityData[x][9] = '';
      }
      let dwCheck = this.props.entityData[x][13];
      if (dwCheck == "Data_Wipe") {
        let dwQty = this.props.entityData[x][14];
        if (dwQty == '') {
          dwQty = 0;
        }
        this.props.entityData[x][6] = dwQty;
      }

    }
    return (
      <div>
        {this.round > 1 && (
          <span id="bidderNote">Note: In Round 2, you can only increase bids and qty caps.</span>
        )}
        <span id="rowInfo"></span>
        <HotTable
          ref={this.hotTableRef}
          data={this.props.entityData}
          height={650}
          width={1446}
          colWidths={[115, 100, 150, 350, 130, 110, 115, 130, 110, 115, 100, 100, 100, 100, 100, 100]}
          nestedHeaders={[
            ["", "", "", "", "", "", "", "", { label: "Your Bid", colspan: 2 }, "", "", "", "", "", ""],
            [
              "Product Id",
              "Brand",
              "Model",
              "Model Name",
              "Grade",
              "Carrier",
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
            columns: [10, 11, 12, 13, 14, 15],
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
          <HotColumn data={0} editor={false} readOnly={true} />
          <HotColumn data={1} editor={false} readOnly={true} />
          <HotColumn data={2} editor={false} readOnly={true} />
          <HotColumn data={3} editor={false} readOnly={true} />
          <HotColumn data={4} editor={false} readOnly={true} />
          <HotColumn data={5} editor={false} readOnly={true} />
          <HotColumn data={6} type="numeric" numericFormat={{ pattern: "0,0", culture: "en-US" }} readOnly={true} className={"htCenter"} />
          <HotColumn data={7} type="numeric" numericFormat={{ pattern: "$0,0.00", culture: "en-US" }} readOnly={true} className={"htCenter"} />
          <HotColumn data={8} type="numeric" numericFormat={{ pattern: "$0,0.00", culture: "en-US" }} className={"htCenter"} />
          <HotColumn data={9} type="numeric" numericFormat={{ pattern: "0,0", culture: "en-US" }} className={"htCenter"} />
          <HotColumn data={10} editor={false} readOnly={true} />
          <HotColumn data={11} editor={false} readOnly={true} />
          <HotColumn data={12} editor={false} readOnly={true} />
          <HotColumn data={13} editor={false} readOnly={true} />
          <HotColumn data={14} editor={false} readOnly={true} />
          <HotColumn data={15} editor={false} readOnly={true} />
        </HotTable>
      </div>
    );
  }
};

export default App;