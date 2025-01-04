import './App.css';
import { createContext, useState, useEffect, useContext } from 'react'
import AppBar from '@mui/material/AppBar';
import Button from '@mui/material/Button';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import Badge from '@mui/material/Badge';
import { useNavigate, Route, Routes, Navigate } from "react-router-dom";
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import Payment from './Payment';

const API = "http://localhost:5000"

const cartCtx = createContext();

const currencyFormatter = (number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: "INR" }).format(number);

function App() {
  const navigate = useNavigate()
  const [cart, setCart] = useState([]);
  const [mobiles, setMobiles] = useState([]);

  useEffect(() => {
    fetch(`${API}/cart`)
      .then(data => data.json())
      .then((cartmbs) => setCart(cartmbs))
  }, []);

  useEffect(() => {
    fetch(`${API}/books`)
      .then((data) => data.json())
      .then((mbs) => setMobiles(mbs))
  }, []);

  const updateCart = ({ product, action }) => {
    console.log(product, action)

    fetch(`${API}/cart?type=${action}`, {
      method: "PUT",
      body: JSON.stringify(product),
      headers: {
        "Content-Type": "application/json"
      }
    })
      .then(data => data.json())
      .then((latestCart) => setCart(latestCart))
  }

  const totalQty = cart
    .map((item) => item.quantity)
    .reduce((sum, quantity) => sum + quantity, 0)

  return (
    <div>
      <cartCtx.Provider value={[cart, updateCart, setCart]}>

        <AppBar position="static">
          <Toolbar>
            <Button color='inherit' onClick={() => navigate('/')}>Home</Button>
            <IconButton color='inherit' aria-label='Cart' style={{ marginLeft: 'auto' }} onClick={() => navigate('/cart')} >
              <Badge badgeContent={totalQty} color="secondary">
                <ShoppingCartIcon />
              </Badge>
            </IconButton>
          </Toolbar>
        </AppBar>

        <Routes>
          <Route exact path='/' element={<Product products={mobiles} />} />

          <Route exact path='/cart' element={<Cart />} />

          <Route exact path='/payment' element={<Payment cart={cart} setCart={setCart} />} />
        </Routes>

      </cartCtx.Provider>
    </div>
  );
}

function Cart() {
  const [cart, updateCart, setCart] = useContext(cartCtx)
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

  useEffect(() => {
    fetch(`${API}/cart`)
      .then(data => data.json())
      .then((cartmbs) => setCart(cartmbs))
  }, [])

  const checkoutCart = () => {

    fetch(`${API}/checkout`, {
      method: "POST",
      body: JSON.stringify(cart),
      headers: {
        "Content-Type": "application/json"
      }
    })
      .then(data => data.json())
      .then((latestCart) => setCart(latestCart))
      .then(() => setOpen(true))
      // .then(() => navigate('/payment'))
      .then(() => setTimeout(() => navigate('/payment'), 1000));
  }

  console.log(cart)

  const total = cart
    .map((item) => item.price * item.quantity)
    .reduce((sum, item) => sum + item, 0)
  return (
    <section className='cart-list'>
      <h1>Purchase Items</h1>
      <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
        <Alert onClose={handleClose} severity="success" sx={{ width: '100%' }}>
          Your order was dispatched successfully!
        </Alert>
      </Snackbar>
      <div className="cart-list-container">
        {cart.map((product) => (
          <CartItem key={product.id} product={product} />
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

function CartItem({ product }) {
  const [cart, updateCart] = useContext(cartCtx)
  console.log(product)
  return (
    <div className="cart-item-container">
      <img src={product?.coverImage} alt={product?.title} className="cart-item-picture" />
      <div>
        <h2 className="cart-item-name">{product?.title}</h2>
        <p className="cart-item-company">{product?.author}</p>
        {/* <h2 className="cart-item-price">{currencyFormatter(mobile.price)}</h2> */}
        <p className="cart-item-quantity">
          <button onClick={() => updateCart({ product, action: 'decrement' })}>➖</button> {product.quantity} <button onClick={() => updateCart({ product, action: 'increment' })}>➕</button>
        </p>
      </div>
      <h2 className="cart-item-price">{currencyFormatter(product.price * product.quantity)}</h2>
    </div>
  )
};

function Product({ products }) {
  const [cart, updateCart] = useContext(cartCtx)
  return (
    <div className="bg-white">
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900">Products</h2>

        <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
          {products.map((product) => (
            <div key={product.id} className="group relative">
              <img
                alt={product.title}
                src={product.coverImage}
                className="aspect-square w-full rounded-md bg-gray-200 object-contain group-hover:opacity-75 lg:aspect-auto lg:h-80"
              />
              <div className="mt-4 flex justify-between">
                <div>
                  <h3 className="text-sm text-gray-700">
                    <a href={product?.href}>
                      <span aria-hidden="true" className="absolute inset-0" />
                      {product.title}
                    </a>
                  </h3>
                  <p className="mt-1 text-sm text-gray-500"><b>Author : </b>{product.author}</p>
                </div>
                <p className="text-sm font-medium text-gray-900">{currencyFormatter(product.price)}</p>
              </div>
              <Button variant="contained" size="large" color="warning" style={{ marginTop: '10px', marginBottom: '24px', width: 100, height: 30 }}
                onClick={() => updateCart({ product, action: 'increment' })}
              ><IconButton color='inherit'><ShoppingCartIcon /></IconButton>Buy</Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}


export default App;
