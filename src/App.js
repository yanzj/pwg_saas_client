import React, {useState, useEffect} from 'react';
import {
  BrowserRouter as Router,
  Route,
  Switch
} from 'react-router-dom';
import { Button } from "antd";

import logo from './logo.svg';

import './css/index.css';

import * as Component from './component/index.js';
import Login from './component/page/Login';
import Products from './component/page/Products';
import Inventory from './component/page/Inventory';
import Orders from './component/page/Orders';
import Configuration from './component/page/Configuration';
import Page_01 from './component/page/component/Page_01';

import PrivateRoute from './utils/component/PrivateRoute';
import PublicRoute from './utils/component/PublicRoute';
import PageNotFound from './utils/component/PageNotFound';
import Loading from './utils/component/Loading';
import { useConfigCache } from './utils/Constants';


let Component_Layout = Component['Layout_01'];
let Component_Header = Component['Header_01'];
// let Component_Footer = Component['Header_01'];

const App = (props) => {
  const [ loggedIn, setLoggedIn ] = useState(false);
  const configCache = useConfigCache();

  useEffect(()=>{
    if (configCache) {
      setLoggedIn(true)
    }
    else {
      setLoggedIn(false)
    }
  },[configCache]);
  
  const Main = () => {
    return (
      <div>
        Main
      </div>
    )
  }

  return (
    <Router>
      <Component_Layout
        header={loggedIn ? (<Component_Header/>) : null}
        footer={loggedIn ? "2020" : null}
      >
        <Switch>
          {/* <PrivateRoute exact path={'/products'} component={Products}/> */}
          <PrivateRoute exact path={'/'} component={Inventory} />
          <PrivateRoute exact path={'/main'} component={Main} />
          <PrivateRoute exact path={'/orders'} component={Orders} />
          <PrivateRoute exact path={'/configuration'} component={Configuration} />
          <PublicRoute restricted={true} exact path={'/login'} component={Login} />
          <Route component={PageNotFound} />
        </Switch>
      </Component_Layout>
    </Router>
  )

}

export default App;
