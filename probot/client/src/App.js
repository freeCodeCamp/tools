import React, { Component } from 'react';
import styled from 'styled-components';

import Tabs from './components/Tabs';
import Search from './components/Search';
import Pareto from './components/Pareto';
import Footer from './components/Footer';

import { ENDPOINT_INFO } from './constants';

const Header = styled.div`
  position: fixed;
  top:0;
  left:0;
  width: 100%;
  margin: 0;
  padding:0;
  overflow: hidden;
  background: #fff;
`;

const AppNav = styled.nav`
  padding: 0 30px; 
  background: ${({ theme }) => theme.primary};
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const NavAnchor = styled.a`
  text-decoration: none;
  color: #fff;
  width: 20vw;
  @media (max-width: 600px) {
    width: 50vw;
  }
`;

const NavTitle = styled.h1`
  width: 60vw;
  text-align: center;
  margin: 0 auto;
  @media (max-width: 600px) {
    width: 100vw;
  }
`;

const PageContainer = styled.div`
  margin-top: 140px;
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 960px;
  width: 90vw;
  padding: 15px;
  border-radius: 4px;
  box-shadow: 0 0 4px 0 #777;
  margin: 30px;
  background-color: #fff;
`;

 const Menu = styled.ul`
  list-style: none;
  display: flex;
  align-items: center;
  background: ${({ theme }) => theme.primary};
  color: white;
  width: 20vw;
  padding: 3px;
  flex-wrap: wrap;
  justify-content: flex-end;
  @media (max-width: 600px) {
    flex-direction: column;
    width: 50vw;
  }
`;

 const MenuLink = styled.a`
   color: #fff!important;
   text-decoration: none;
   display: block;
   padding: 5px;
   @media (max-width: 600px) {
    flex-direction: column;
  }
`;

const imgStyle = { width: '100%', height: 'auto' };

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
       <Header>
        <AppNav>
          <NavAnchor href="https://www.freecodecamp.org" target="_blank" rel="noopener noreferrer">
            <img alt="learn to code javascript at freeCodeCamp logo"
              style={imgStyle}
              className="img-responsive nav-logo"
              src="https://s3.amazonaws.com/freecodecamp/freecodecamp_logo.svg"
            />
          </NavAnchor>
          <NavTitle>Contributor Tools</NavTitle>
          <Menu>
            <li class="hidden-xs return-to-free-code-camp">
              <MenuLink href="/">Home</MenuLink>
            </li>
            <li class="return-to-free-code-camp" target="_blank">
              <MenuLink href="https://github.com/freeCodeCamp/freeCodeCamp" target="_blank" rel="noopener noreferrer">GitHub</MenuLink>
            </li>
          </Menu>
        </AppNav>
        <Tabs view={view} onViewChange={handleViewChange} />
      </Header>
      <PageContainer>
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
