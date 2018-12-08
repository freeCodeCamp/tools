import React from 'react';
import styled from 'styled-components';

const List = styled.div`
  margin: 5px;
  display: flex;
  flex-direction: column;
`;

const ListItem = styled.div`
  padding: 0 5px;
  display: flex;
  justify-content: space-between;
  flex-direction: row;
`;

const Filename = styled.div`
margin: 10px 0;
&:nth-child(odd) {
  background: #eee;
}
padding: 3px;
`;

const prNumStyle = { flex: 1 };
const usernameStyle = { flex: 1 };
const titleStyle = { flex: 3 };

const FilenameResults = ({ searchValue, results }) => {
  const elements = results.map((result) => {
    const { filename, prs: prObjects } = result;
    const prs = prObjects.map(({ number, username, title }, index) => {
      const prUrl = `https://github.com/freeCodeCamp/freeCodeCamp/pull/${number}`;
      return (
        <ListItem key={`${filename}-${index}`}>
          <a style={prNumStyle} href={prUrl} rel="noopener noreferrer" target="_blank">{number}</a>
          <span style={usernameStyle}>{username}</span>
          <span style={titleStyle}>{title}</span>
        </ListItem>
      );
    });

    const fileOnMaster = `https://github.com/freeCodeCamp/freeCodeCamp/blob/master/${filename}`;
    return (
      <Filename key={filename}>
        {filename} <a href={fileOnMaster} rel="noopener noreferrer" target="_blank">(File on Master)</a>
        <List>
          {prs}
        </List>
      </Filename>
    );
  });

  return (
    <div>
      {results.length ? <h3>Results for: {searchValue}</h3> : null}
      {elements}
    </div>
  );
};

export default FilenameResults;
