import React, { Component } from 'react';

import Input from './Input';
import PrResults from './PrResults';
import FilenameResults from './FilenameResults';
import SearchOption from './SearchOption';
class Search extends Component {
  state = {
    searchValue: '',
    selectedOption: 'pr',
    results: []
  };

  clearObj = { searchValue: '', results: [] };

  inputRef = React.createRef();

  handleInputEvent = (event) => {
    const { type, key, target: { value: searchValue } } = event;

    if (type === 'change') {
      if (this.state.selectedOption === 'pr'){
        if (Number(searchValue) || searchValue === '') {
          this.setState((prevState) => ({ searchValue, results: [] }));
        }
      }
      else {
        this.setState((prevState) => ({ searchValue, results: [] }));
      }
    }
    else if (type === 'keypress' && key === 'Enter') {
      this.searchPRs(searchValue);
    }
  }

  handleButtonClick = () => {
    const { searchValue } = this.state;
    this.searchPRs(searchValue);
  }

  handleOptionChange = (changeEvent) => {
    const selectedOption = changeEvent.target.value;
    this.setState((prevState) => ({ selectedOption, ...this.clearObj }));
  }

  searchPRs = (value) => {
    const { selectedOption } = this.state;
    const baseUrl = 'https://pr-relations.glitch.me/';
    const fetchUrl = baseUrl + (selectedOption === 'pr' ? `pr/${value}` : `search/?value=${value}`);
    fetch(fetchUrl)
    .then((response) => response.json())
    .then((response) => {
      if (response.ok) {
        const { results }  = response;
        const objArrName = selectedOption === 'pr' ? 'filenames' : 'prs';
        if (!results.length) {
          results.push({ searchValue: 'No matching results', [objArrName]: [] });
        }
        this.setState((prevState) => ({ results }));
      }
      else {
        this.inputRef.current.focus();
      }
    })
    .catch(() => {
      this.setState((prevState) => (this.clearObj));
    });
  }

  render() {
    const { handleButtonClick, handleInputEvent, inputRef, handleOptionChange, state } = this;
    const { searchValue, results, selectedOption } = state;
    return (
      <>
        <div>
          <SearchOption value="pr" onOptionChange={handleOptionChange} selectedOption={selectedOption}>
            PR #
          </SearchOption>
          <SearchOption value="filename" onOptionChange={handleOptionChange} selectedOption={selectedOption}>
            Filename
          </SearchOption>
        </div>
        <Input ref={inputRef} value={searchValue} onInputEvent={handleInputEvent} />
        <button onClick={handleButtonClick}>Search</button>
        {selectedOption === 'pr' && <PrResults searchValue={searchValue} results={results} /> }
        {selectedOption === 'filename' && <FilenameResults searchValue={searchValue} results={results} /> }
      </>
    );
  }
}

export default Search;
