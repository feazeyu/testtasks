import React from 'react';
import Autocomplete from './Autocomplete';
require("./styles.css");
const App = () => {
  return (
    <form action='submit.php'>
    <div className="App flex">
      <div className='flex'>
      <div className="content">
        <Autocomplete/>
      </div>
      <div>
        <button type="submit" className='button' value="submit">Submit</button>
      </div>    
    </div>
    </div>
    </form>
  );
}

export default App;
