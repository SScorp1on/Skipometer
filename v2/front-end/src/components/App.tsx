import React from 'react';
import { BrowserRouter as Router,Routes, Route } from 'react-router-dom';
import ControlPanel from './ControlPanel/ControlPanel';
import Skipometer from './Skipometer/Skipometer';
import './common/style.css';

const App = () => {
    return (
        <Router>
      <Routes>
        <Route path="/" element={ <ControlPanel />}/>
        <Route path="/ControlPanel" element={<ControlPanel />}/>
        <Route path="/Skipometer" element={<Skipometer />}/>
      </Routes>
        </Router>
    );
}

export default App;
