import logo from './logo.svg';
import './App.css';

function App() {
  return (
    <div>
      <Phone />
    </div>

  );
}

 function Phone(){
  const mobile = {
    model: "OnePlus 9 5G",
    img: "https://m.media-amazon.com/images/I/61fy+u9uqPL._SX679_.jpg",
    company: "Oneplus"
  };
  return(
    <div className="phone-container">
      <img src={mobile.img} alt="" className="phone-picture"/>
      <h2 className="phone-name">{mobile.model}</h2>
      <p className="phone-company">{mobile.company}</p>
    </div>
  )
}

export default App;
