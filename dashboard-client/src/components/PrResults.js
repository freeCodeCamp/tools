import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
  margin-bottom: 15px;
`;

const List = styled.ul`
  margin: 3px;
`;

const PrInfo = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`;

const prNumStyle = { flex: 1 };
const usernameStyle = { flex: 1 };
const titleStyle = { flex: 3 };

const PrResults = ({ searchValue, results }) => {
  const elements = results.map((result, idx) => {
    const { number, filenames, username, title } = result;
    const files = filenames.map((filename, index) => {
      const fileOnMaster = `https://github.com/freeCodeCamp/freeCodeCamp/blob/master/${filename}`;
      return (
        <li key={`${number}-${index}`}>
          {filename}> <a href={fileOnMaster} rel="noopener noreferrer" target="_blank">(File on Master)</a>
        </li>
      );
    });
    const prUrl = `https://github.com/freeCodeCamp/freeCodeCamp/pull/${number}`

    return (
      <Container key={`${number}-${idx}`}>
        {!Number(number)
          ? number
          : <PrInfo>
              <a style={prNumStyle} href={prUrl} rel="noopener noreferrer" target="_blank">{number}</a>
              <span style={usernameStyle}>{username}</span>
              <span style={titleStyle}>{title}</span>
            </PrInfo>
        }
        <List>
          {files}
        </List>
      </Container>
    );
  });

  return (
    <div>
      {results.length ? <h3>Results for PR# {searchValue}</h3> : null}
      {elements}
    </div>
  );
};

export default PrResults;
