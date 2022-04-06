import logo from './logo.svg';
import './App.css';
import useState from 'react'

function App() {
  
  const [mobiles,setMobiles] = useState([])
   
  fetch("http://localhost:4000/mobiles")
  .then((data) => data.json())
  .then((mbs) => setMobiles(mbs))

  return (
    <div className="App phone-list-container">
      {mobiles.map(mobile =><Phone mobile={mobile} /> )}
    </div>
  );
}

 function Phone({mobile}){
  return(
    <div className="phone-container">
      <img src={mobile.img} alt={mobile.model} className="phone-picture"/>
      <h2 className="phone-name">{mobile.model}</h2>
      <p className="phone-company">{mobile.company}</p>
    </div>
  )
}

export default App;
