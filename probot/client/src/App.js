import React, { Component } from 'react';
import styled from 'styled-components';

import Tabs from './components/Tabs';
import Search from './components/Search';
import Pareto from './components/Pareto';
import Footer from './components/Footer';

import { ENDPOINT_INFO } from './constants';

const PageContainer = styled.div`
  margin-top: 70px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  @media (max-width: 991px) {
    margin-top: 135px; 
  }
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  max-width: 960px;
  width: 90vw;
  padding: 15px;
  border-radius: 4px;
  box-shadow: 0 0 4px 0 #777;
`;

const AppNavBar = styled.nav`
  margin: 0;
  padding-right: 30px;
  color: white;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  display:flex;
  justify-content: space-between;
  align-items: center;
  background: ${({ theme }) => theme.primary};
  @media (max-width: 991px) {
    flex-direction: column;
    padding: 5px;
  }
`;

const LogoImg = styled.img`
  display: block;
  max-width: 100%;
  padding-top: 5px;
  padding-left: 30px;
  height: 38px;
  @media (max-width: 991px) {
    padding-left: 5px;
    padding-right: 5px;
  }
`;

const NavTitle = styled.h1`
  margin: 0;
  padding: 0;
  text-align: center;
  @media (max-width: 991px) {
    padding: 0 0 10px 0;
  }
`;


class App extends Component {
  state = {
    view: 'search',
    footerInfo: null
  };

  updateInfo() {
    fetch(ENDPOINT_INFO)
      .then(response => response.json())
      .then(({ ok, numPRs, prRange, lastUpdate }) => {
        if (ok) {
          const footerInfo = { numPRs, prRange, lastUpdate };
          this.setState(prevState => ({ footerInfo }));
        }
      })
      .catch(() => {
        // do nothing
      });
  }

  handleViewChange = ({ target: { id } }) => {
    const view = id.replace('tabs-', '');
    this.setState(prevState => ({ ...this.clearObj, view }));
    this.updateInfo();
  };

  componentDidMount() {
    this.updateInfo();
  }

  render() {
    const {
      handleViewChange,
      state: { view, footerInfo }
    } = this;
    return (
      <>
      <AppNavBar>
      <a className="nav-item" href="https://freecodecamp.org" target="_blank" rel="noopener noreferrer">
        <LogoImg
          src="https://s3.amazonaws.com/freecodecamp/freecodecamp_logo.svg"
          alt="learn to code at freeCodeCamp logo"
        />
      </a>
        <NavTitle className="nav-item">Contributor Tools</NavTitle>
        <ul className="app-menu nav-item">
          <li>
            <a href="/">Home</a>
           </li>
           <li>
             <a href="https://github.com/freeCodeCamp/freeCodeCamp" target="_blank" rel="noopener noreferrer">GitHub</a>
           </li>
        </ul>
      </AppNavBar>
      <PageContainer>
        <Tabs view={view} onViewChange={handleViewChange} />
        <Container>
          {view === 'search' && <Search />}
          {view === 'reports' && <Pareto />}
        </Container>
        {footerInfo && <Footer footerInfo={footerInfo} />}
      </PageContainer>
      </>
    );
  }
}
export default App;
