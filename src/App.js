import './App.css';
import  {createContext,useState, useEffect,useContext } from 'react'
import AppBar from '@mui/material/AppBar';
import Button from '@mui/material/Button';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import Badge from '@mui/material/Badge';
import {useNavigate,Route,Routes,Navigate} from "react-router-dom";
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import Payment from './Payment';


const API = 'https://e-commerce46.herokuapp.com'
// const API = "http://localhost:5000/mobiles"

const cartCtx = createContext();

const currencyFormatter = (number) => 
      new Intl.NumberFormat('en-IN' , {style : 'currency' , currency : "INR"}).format(number);

function App() {
  const navigate = useNavigate()
  const [cart,setCart] = useState([])

  useEffect(() =>{
    fetch(`${API}/cart`)
    .then(data => data.json())
    .then((cartmbs) => setCart(cartmbs))
    },[])

  const [mobiles,setMobiles] = useState([]);
   useEffect(() =>{
    fetch(`${API}/mobiles`)
    .then((data) => data.json())
    .then((mbs) => setMobiles(mbs))
  },[])

  const updateCart = ({mobile,action}) => {
   
    fetch(`${API}/cart?type=${action}`,{
      method:"PUT",
      body:JSON.stringify(mobile),
      headers:{
        "Content-Type" : "application/json"
      }
    })
    .then(data => data.json())
    .then((latestCart) => setCart(latestCart))
  }

  const totalQty = cart
  .map((item) => item.qty)
  .reduce((sum,qty) => sum+qty,0)
  
return (
    <div className="App phone-list-container">
      <cartCtx.Provider value={[cart,updateCart,setCart]}>

       <AppBar position="static">
       <Toolbar>
         <Button  color='inherit' onClick={() => navigate('/')}>Home</Button>
       <IconButton color='inherit' aria-label='Cart' style={{marginLeft : 'auto'}} onClick={() => navigate('/cart')} >
       <Badge badgeContent={totalQty} color="secondary">
         <ShoppingCartIcon />
       </Badge>
       </IconButton>
       </Toolbar>
       </AppBar>

       <Routes>
         <Route exact path='/' element={mobiles.map(mobile =>
      <Phone key={mobile._id} mobile={mobile} /> )} />

      <Route exact path='/cart' element={<Cart />} />
       
      <Route exact path='/payment' element={<Payment cart={cart} setCart={setCart}/>} />
      </Routes>
      
      </cartCtx.Provider>
    </div>
  );
}

function Cart(){
  const [cart,updateCart,setCart] = useContext(cartCtx)
  const [open, setOpen] = useState(false);
  const navigate = useNavigate()

  const handleClick = () => {
    setOpen(true);
  };

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setOpen(false);
  };

  useEffect(() =>{
    fetch(`${API}/cart`)
    .then(data => data.json())
    .then((cartmbs) => setCart(cartmbs))
    },[])

    const checkoutCart = () => {
   
      fetch(`${API}/checkout`,{
        method:"POST",
        body:JSON.stringify(cart),
        headers:{
          "Content-Type" : "application/json"
        }
      })
      .then(data => data.json())
      .then((latestCart) => setCart(latestCart))
      .then(() => setOpen(true))
      // .then(() => navigate('/payment'))
      .then(() => setTimeout(() => navigate('/payment'),1000));
    }

  const total = cart
  .map((item) => item.price * item.qty)
  .reduce((sum,item) => sum+item,0)
  return(
    <section className='cart-list'>
      <h1>Purchase Items</h1>
      <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
  <Alert onClose={handleClose} severity="success" sx={{ width: '100%' }}>
    Your order was dispatched successfully!
  </Alert>
</Snackbar>
    <div className="cart-list-container">
      {cart.map((mobile)=>(
        <CartItem key={mobile._id} mobile={mobile} />
      ))}
    </div>
    <div className='cart-checkout'>
    <h2 className='cart-checkout-price'>{currencyFormatter(total)}</h2>
      <Button variant="contained" size="large" color="inherit" onClick={() => checkoutCart()}>
      <IconButton color="inherit" aria-label="add to shopping cart">
      <AddShoppingCartIcon />
       </IconButton>
         Checkout</Button>
      
    </div>
    </section>
  )
}

function CartItem({mobile}){
  const [cart,updateCart] = useContext(cartCtx)
  return(
    <div className="cart-item-container">
      <img src={mobile.img} alt={mobile.model} className="cart-item-picture"/>
      <div>
      <h2 className="cart-item-name">{mobile.model}</h2>
      <p className="cart-item-company">{mobile.company}</p>
      {/* <h2 className="cart-item-price">{currencyFormatter(mobile.price)}</h2> */}
      <p className="cart-item-quantity">
         <button onClick={() => updateCart({mobile,action:'decrement'})}>➖</button> {mobile.qty} <button onClick={() => updateCart({mobile,action:'increment'})}>➕</button> 
      </p>
       </div>
       <h2 className="cart-item-price">{currencyFormatter(mobile.price*mobile.qty)}</h2>
    </div>
  )
}

 function Phone({mobile}){
  const [cart,updateCart] = useContext(cartCtx)
  return(
    <div className="phone-container">
      <img src={mobile.img} alt={mobile.model} className="phone-picture"/>
      <h2 className="phone-name">{mobile.model}</h2>
      <p className="phone-company">{mobile.company}</p>
      <h2 className="phone-price">{currencyFormatter(mobile.price)}</h2>
      <Button variant="contained" size="large" color="warning" style={{marginBottom : '24px',width:200,height:40}}
      onClick={() => updateCart({mobile,action:'increment'})}
      ><IconButton color='inherit'><ShoppingCartIcon /></IconButton>Add to cart</Button>
    </div>
  )
}





export default App;
