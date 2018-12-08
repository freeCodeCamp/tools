import React from 'react';
import styled from 'styled-components';

const Result = styled.div`
  word-wrap: break-word;
  margin: 10px 0;
  &:nth-child(odd) {
    background: #eee;
  }
  padding: 3px;
`;

const List = styled.div`
  margin: 5px;
  display: flex;
  flex-direction: column;
`;

const ListItem = styled.div`
  display: flex;
  justify-content: space-between;
  flex-direction: row;
  overflow: hidden;
`;

const prNumStyle = { flex: 1 };
const usernameStyle = { flex: 1 };
const titleStyle = { flex: 3 };
const detailsStyle = { padding: '3px' };
const filenameTitle = { fontWeight: '600' };

class Pareto extends React.Component {
  state = {
    data: []
  };

  componentDidMount() {
    fetch(`https://pr-relations.glitch.me/pareto`)
    .then((response) => response.json())
    .then(({ ok, pareto }) => {
      if (ok) {
        if (!pareto.length) {
          pareto.push({ filename: 'Nothing to show in Pareto Report', count: 0, prs: [] });
        }
        this.setState((prevState) => ({ data: pareto }));
      }
    })
    .catch(() => {
      const pareto = [{ filename: 'Nothing to show in Pareto Report', count: 0, prs: [] }];
      this.setState((prevState) => ({ data: pareto }));
    });
  }

  render() {
    const { data } = this.state;
    const elements = data.map((entry) => {
      const { filename, count, prs } = entry;
      const prsList = prs.map(({ number, username, title }) => {
        const prUrl = `https://github.com/freeCodeCamp/freeCodeCamp/pull/${number}`;
        return (
          <ListItem>
            <a style={prNumStyle} href={prUrl} rel="noopener noreferrer" target="_blank">
              #{number}
            </a>
            <span style={usernameStyle}>{username}</span>
            <span style={titleStyle}>{title}</span>
          </ListItem>
        )
      });
      const fileOnMaster = `https://github.com/freeCodeCamp/freeCodeCamp/blob/master/${filename}`;
      return (
        <Result key={filename}>
          <span style={filenameTitle}>{filename}</span> <a href={fileOnMaster} rel="noopener noreferrer" target="_blank">(File on Master)</a><br />
          <details style={detailsStyle}>
            <summary># of PRs: {count}</summary>
            <List>{prsList}</List>
          </details>
        </Result>
      );
    });

    return (
      <div>
        {data.length ? elements : 'Report Loading...'}
      </div>
    );
  }
}

export default Pareto;
