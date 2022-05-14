import axios from "axios";
import React, { Component, Fragment } from "react";
class Autocomplete extends Component {
  static defaultProps = {
    suggestions: []
  };

  constructor(props) {
    super(props);

    this.state = {
        userInput: '',
        filteredSuggestions: [], 
        activeSuggestion: 0,
        showSuggestions: true,
    };
    var { suggestions } = this.props;
    //Fetch users via API and populate the array
    axios.get("https://jsonplaceholder.typicode.com/users").then(res => 
    {
     let users = res.data;
     for (let user in users) {
      suggestions.push(users[user].name);
    }
    });
  }

  //Called everytime the input content changes
  onChange = (e) => {
    var { suggestions } = this.props;
    //Filter out incorrect suggestions
    const userInput = e.currentTarget.value;
    const filteredSuggestions = suggestions.filter(suggestion => {return suggestion.toLowerCase().includes(userInput.toLowerCase())})
    this.setState({
      userInput,
      filteredSuggestions,
      activeSuggestion: 0,
      showSuggestions: true
    })
  };

  //Keyboard navigation handling in autocorrect options
  onKeyDown = (e) => {
    var { activeSuggestion, userInput, filteredSuggestions, showSuggestions} = this.state;
    switch(e.keyCode){
      case 38: //arrowUp
        if(activeSuggestion !== 0){
          activeSuggestion -= 1;
          this.setState({
            userInput,
            filteredSuggestions,
            activeSuggestion,
            showSuggestions
          })
        }
        break;
      case 40: //arrowDown
        if(activeSuggestion !== filteredSuggestions.length-1){
          activeSuggestion += 1;
          this.setState({
            userInput,
            filteredSuggestions,
            activeSuggestion,
            showSuggestions
        })
      }
        break;
      case 13: //enter
          this.setState({
            userInput: filteredSuggestions[activeSuggestion],
            filteredSuggestions,
            activeSuggestion: 0,
            showSuggestions: false
        })
        break;
      default:break;
    }
  };

  //Mouseclick autocorrect selection
  onClick = (e) => {
    this.setState({
      userInput: e.currentTarget.innerText,
      filteredSuggestions: [],
      activeSuggestion: 0,
      showSuggestions: false
    })
  };

  render() {
    const {
      onChange,
      onKeyDown,
      state:{
        userInput,
        filteredSuggestions,
        activeSuggestion,
        showSuggestions
      }
    } = this
    let suggestionsListComponent;
    if(filteredSuggestions.length > 0 && showSuggestions && userInput.length > 0){
        suggestionsListComponent = (
          <ul className="nomargin nopadding">
            {filteredSuggestions.map((suggestion, i) =>{   //Sometimes throws a ton of errors with duplicate keys, no clue what causes it and why does it happen
              let className = "dropdown-element";
              if(i === activeSuggestion){
                className = "dropdown-element active"
              }
              return(
                <li className={className} key={suggestion} onClick={this.onClick}>{suggestion}</li>
              )
            })}
          </ul>
        )
    }
    return (
      <Fragment>
        <input
          className="input"
          type="text"
          onChange={onChange}
          onKeyDown={onKeyDown}
          value={userInput}
        />
        {suggestionsListComponent}
      </Fragment>
    );
  }
}

export default Autocomplete;
