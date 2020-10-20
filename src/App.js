import React from 'react';
import './App.css';
import Viewer from "./viewer";
import GraphComponent from "./ge-vis/component";

function App() {
  return (
    <div className="App">

      {/*<h1>Viewer</h1>*/}

      <div className={"sidebar"}>

      </div>
        <div className={"mainContent"}>
                  {/* <Viewer /> */}
                  <GraphComponent />    
        </div>

    </div>
  );
}

export default App;
