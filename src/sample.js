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


// const API = 'https://9389-223-185-20-32.ngrok-free.app'
const API = "http://localhost:5000"

const cartCtx = createContext();

const currencyFormatter = (number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: "INR" }).format(number);

function Sample() {
  const navigate = useNavigate()
  const [cart, setCart] = useState([])

  useEffect(() => {
    fetch(`${API}/cart`)
      .then(data => data.json())
      .then((cartmbs) => setCart(cartmbs))
  }, [])

  const [mobiles, setMobiles] = useState([]);
  useEffect(() => {
    fetch(`${API}/books`)
      .then((data) => data.json())
      .then((mbs) => setMobiles(mbs))
  }, [])

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
          <Route exact path='/' element={mobiles.map(mobile =>
            <Phone key={mobile.id} mobile={mobile} />)} />

          <Route exact path='/product' element={<Product products={mobiles} />} />

          <Route exact path='/products' element={<Example />} />

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
}

function Phone({ mobile }) {
  const [cart, updateCart] = useContext(cartCtx)
  return (
    <div className="phone-container">
      <img src={mobile.coverImage} alt={mobile.model} className="phone-picture" />
      <h2 className="phone-name">{mobile.title}</h2>
      <p className="phone-company">{mobile.company}</p>
      <h2 className="phone-price">{currencyFormatter(mobile.price)}</h2>
      <Button variant="contained" size="large" color="warning" style={{ marginBottom: '24px', width: 200, height: 40 }}
        onClick={() => updateCart({ mobile, action: 'increment' })}
      ><IconButton color='inherit'><ShoppingCartIcon /></IconButton>Add to cart</Button>
    </div>
  )
}

function Product({ products }) {
  const [cart, updateCart] = useContext(cartCtx)
  return (
    <div className="bg-white">
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900">Customers also purchased</h2>

        <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
          <div className="group relative">
            <img src="https://tailwindui.com/plus/img/ecommerce-images/product-page-01-related-product-01.jpg" alt="Front of men&#039;s Basic Tee in black." className="aspect-square w-full rounded-md bg-gray-200 object-cover group-hover:opacity-75 lg:aspect-auto lg:h-80" />
            <div className="mt-4 flex justify-between">
              <div>
                <h3 className="text-sm text-gray-700">
                  <a href="#">
                    <span aria-hidden="true" className="absolute inset-0"></span>
                    Basic Tee
                  </a>
                </h3>
                <p className="mt-1 text-sm text-gray-500">Black</p>
              </div>
              <p className="text-sm font-medium text-gray-900">$35</p>
            </div>
          </div>
        </div>

      </div>
    </div>
    // </div>
  )
}

const products = [
  {
    "id": "624fdc1b70083519da789f6b",
    "title": "The Alchemist",
    "author": "Paulo Coelho",
    "description": "The Alchemist is a novel by Brazilian author Paulo Coelho that was first published in 1988. Originally written in Portuguese, it became a widely translated international bestseller.",
    "coverImage": "https://m.media-amazon.com/images/I/61HAE8zahLL._AC_UF1000,1000_QL80_.jpg",
    "price": 50,
    "created_at": "2024-08-12T14:56:50.000Z",
    "updated_at": "2024-08-12T14:56:50.000Z"
  },
  {
    "id": 3,
    "title": "Twilight",
    "author": "Stephenie Meyer",
    "description": "Twilight is a series of four vampire-themed fantasy romance novels by American author Stephenie Meyer. Released annually from 2005 through 2008, the four books chart the later teen years of Isabella Bella",
    "coverImage": "https://m.media-amazon.com/images/I/61eoeu1UpRL._UF1000,1000_QL80_.jpg",
    "price": 150,
    "created_at": "2024-08-12T15:03:39.000Z",
    "updated_at": "2024-08-12T15:03:39.000Z"
  },
  {
    "id": 4,
    "title": "The Fault in Our Stars",
    "author": "John Green",
    "description": "The Fault in Our Stars is a novel by John Green. It is his fourth solo novel and sixth novel overall. It was published on January 10, 2012. The title is inspired by Act 1, Scene 2 of Shakespeare's play Julius Caesar, in which the nobleman Cassius says to Brutus: 'The fault, dear Brutus, is not in our stars, / But in ourselves, that we are underlings.'",
    "coverImage": "https://rukminim2.flixcart.com/image/850/1000/k4d27ww0/book/0/7/8/the-fault-in-our-stars-original-imadwbg3nnsyncnz.jpeg?q=90&crop=false",
    "price": 260,
    "created_at": "2024-08-12T15:05:17.000Z",
    "updated_at": "2024-08-12T15:05:17.000Z"
  },
  {
    "id": 5,
    "title": "The Alchemist",
    "author": "Paulo Coelho",
    "description": "The Alchemist is a novel by Brazilian author Paulo Coelho that was first published in 1988. Originally written in Portuguese, it became a widely translated international bestseller.",
    "coverImage": "https://m.media-amazon.com/images/I/61HAE8zahLL._AC_UF1000,1000_QL80_.jpg",
    "price": 50,
    "created_at": "2024-08-12T14:56:50.000Z",
    "updated_at": "2024-08-12T14:56:50.000Z"
  },
  {
    "id": 6,
    "title": "Twilight",
    "author": "Stephenie Meyer",
    "description": "Twilight is a series of four vampire-themed fantasy romance novels by American author Stephenie Meyer. Released annually from 2005 through 2008, the four books chart the later teen years of Isabella Bella",
    "coverImage": "https://m.media-amazon.com/images/I/61eoeu1UpRL._UF1000,1000_QL80_.jpg",
    "price": 150,
    "created_at": "2024-08-12T15:03:39.000Z",
    "updated_at": "2024-08-12T15:03:39.000Z"
  },
  {
    "id": 7,
    "title": "The Fault in Our Stars",
    "author": "John Green",
    "description": "The Fault in Our Stars is a novel by John Green. It is his fourth solo novel and sixth novel overall. It was published on January 10, 2012. The title is inspired by Act 1, Scene 2 of Shakespeare's play Julius Caesar, in which the nobleman Cassius says to Brutus: 'The fault, dear Brutus, is not in our stars, / But in ourselves, that we are underlings.'",
    "coverImage": "https://rukminim2.flixcart.com/image/850/1000/k4d27ww0/book/0/7/8/the-fault-in-our-stars-original-imadwbg3nnsyncnz.jpeg?q=90&crop=false",
    "price": 260,
    "created_at": "2024-08-12T15:05:17.000Z",
    "updated_at": "2024-08-12T15:05:17.000Z"
  },
  {
    "id": 8,
    "title": "The Alchemist",
    "author": "Paulo Coelho",
    "description": "The Alchemist is a novel by Brazilian author Paulo Coelho that was first published in 1988. Originally written in Portuguese, it became a widely translated international bestseller.",
    "coverImage": "https://m.media-amazon.com/images/I/61HAE8zahLL._AC_UF1000,1000_QL80_.jpg",
    "price": 50,
    "created_at": "2024-08-12T14:56:50.000Z",
    "updated_at": "2024-08-12T14:56:50.000Z"
  },
  {
    "id": 9,
    "title": "Twilight",
    "author": "Stephenie Meyer",
    "description": "Twilight is a series of four vampire-themed fantasy romance novels by American author Stephenie Meyer. Released annually from 2005 through 2008, the four books chart the later teen years of Isabella Bella",
    "coverImage": "https://m.media-amazon.com/images/I/61eoeu1UpRL._UF1000,1000_QL80_.jpg",
    "price": 150,
    "created_at": "2024-08-12T15:03:39.000Z",
    "updated_at": "2024-08-12T15:03:39.000Z"
  },
  {
    "id": 10,
    "title": "The Fault in Our Stars",
    "author": "John Green",
    "description": "The Fault in Our Stars is a novel by John Green. It is his fourth solo novel and sixth novel overall. It was published on January 10, 2012. The title is inspired by Act 1, Scene 2 of Shakespeare's play Julius Caesar, in which the nobleman Cassius says to Brutus: 'The fault, dear Brutus, is not in our stars, / But in ourselves, that we are underlings.'",
    "coverImage": "https://rukminim2.flixcart.com/image/850/1000/k4d27ww0/book/0/7/8/the-fault-in-our-stars-original-imadwbg3nnsyncnz.jpeg?q=90&crop=false",
    "price": 260,
    "created_at": "2024-08-12T15:05:17.000Z",
    "updated_at": "2024-08-12T15:05:17.000Z"
  }
]

function Example() {
  const [cart, updateCart] = useContext(cartCtx)
  return (
    <div className="bg-white">
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900">Products</h2>

        <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
          {products.map((product) => (
            <div key={product.id} className="group relative">
              <img
                alt={product.coverImage}
                src={product.coverImage}
                className="aspect-square w-full rounded-md bg-gray-200 object-contain group-hover:opacity-75 lg:aspect-auto lg:h-80"
              />
              <div className="mt-4 flex justify-between">
                <div>
                  <h3 className="text-sm text-gray-700">
                    <a href={product.href}>
                      <span aria-hidden="true" className="absolute inset-0" />
                      {product.title}
                    </a>
                  </h3>
                  <p className="mt-1 text-sm text-gray-500"><b>Author : </b>{product.author}</p>
                </div>
                <p className="text-sm font-medium text-gray-900">{currencyFormatter(product.price)}</p>
              </div>
              <Button variant="contained" size="large" color="warning" style={{ marginBottom: '24px', width: 200, height: 40 }}
                onClick={() => updateCart({ product, action: 'increment' })}
              ><IconButton color='inherit'><ShoppingCartIcon /></IconButton>Add to cart</Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}


export default Sample;
