import React from "react";
import "./App.css";
import * as xlsx from "xlsx";
// @ts-ignore
import { Chart } from "react-charts";

type State = {
  dataReady: boolean;
  data?: {
    TOT: any[];
    ASS: any[];
  };
};

export class App extends React.Component<{}, State> {
  state = {
    dataReady: false,
    data: {
      TOT: [],
      ASS: [],
    },
  };

  render() {
    return (
      <div>
        <input type="file" onChange={(e) => this.handleChange(e.target.files)} />
        {this.renderChart()}
      </div>
    );
  }

  private handleChange(selectorFiles: FileList | null) {
    console.log(selectorFiles);
    if (selectorFiles) {
      const file = selectorFiles[0];
      const reader = new FileReader();
      reader.onload = this.onEventLoad.bind(this);

      reader.readAsBinaryString(file);
    }
  }

  private onEventLoad(event: ProgressEvent<FileReader>) {
    const data = event.target?.result;
    let parsedData = xlsx.read(data, { type: "binary" });
    const dataSheetName = parsedData.SheetNames[1]; // DATA charts
    const dataSheet: xlsx.WorkSheet = parsedData.Sheets[dataSheetName];

    // console.log(dataSheet);
    const totCol = "AH";
    const assCol = "AI";
    let TOT: any[] = [];
    let ASS: any[] = [];

    Object.keys(dataSheet).forEach((key) => {
      const value = dataSheet[key];
      if (key.startsWith(totCol) && value["v"] !== "TOT") {
        TOT.push(value["v"]);
      } else if (key.startsWith(assCol) && value["v"] !== "ASS") {
        ASS.push(value["v"]);
      }
    });

    TOT = TOT.filter(t => typeof t !== "string");
    ASS = ASS.filter(t => typeof t !== "string");

    this.setState({
      dataReady: true,
      data: { TOT, ASS },
    });
  }

  private renderChart(): JSX.Element {
    if (this.state.dataReady) {
      return (
        <MyChart data={{ TOT: this.state.data?.TOT, ASS: this.state.data?.ASS }} />
      );
    }

    return <></>;
  }
}

function MyChart(props: { data: { TOT: any[]; ASS: any[] } }) {
  const tots = props.data?.TOT.map((t, i) => [i, t]);
  const ass = props.data?.ASS.map((a, i) => [i, a]);

  const data = React.useMemo(
    () => [
      {
        label: "TOT",
        data: tots,
      },
      {
        label: "ASS",
        data: ass,
      },
    ],
    [ass, tots]
  );

  const series = React.useMemo(
    () => ({
      type: "bar",
    }),
    []
  );
  const axes = React.useMemo(
    () => [
      { primary: true, type: "ordinal", position: "bottom" },
      { position: "left", type: "linear", stacked: true },
    ],
    []
  );

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
      }}>
      <Chart data={data} axes={axes} series={series} />
    </div>
  );
}

export default App;
