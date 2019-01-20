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
`;

const AppNav = styled.nav`
  padding: 0 30px; 
  background: ${({ theme }) => theme.primary};
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
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
`;

 const Menu = styled.ul`
  list-style: none;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
 `;

 const MenuLink = styled.a`
   color: #ffffff;
   text-decoration: none;
   display: block;
   padding: 5px;
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
       <Header>
        <AppNav>
          <div>
              <a href="https://www.freecodecamp.org" target="_blank" rel="noopener noreferrer">
                <img alt="learn to code javascript at freeCodeCamp logo"
                  className="img-responsive nav-logo"
                  src="https://s3.amazonaws.com/freecodecamp/freecodecamp_logo.svg"
                />
              </a>
          </div>

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
