import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { dummyProducts } from "../assets/assets";
import toast from "react-hot-toast";
import axios from "axios";

// Configure axios defaults
axios.defaults.withCredentials = true;
axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL;

export const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [isSeller, setIsSeller] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [products, setProducts] = useState([]);
  const [cartItems, setCartItems] = useState({});
  const [search, setSearch] = useState({});

  // Add token to axios requests if available
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, []);

  // Fetch seller status
  const fetchSeller = async () => {
    try {
      const {data} = await axios.get("/api/seller/isauth");
      if(data.success){
        setIsSeller(true);
      } else {
        setIsSeller(false);
      }
    } catch (error) {
      setIsSeller(false);
    }
  }

  // Fetch user with token authentication
  const fetchUser = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('Fetching user with token:', token);
      
      const {data} = await axios.get('/api/user/isauth');
      console.log('User auth response:', data);
      
      if(data.success){
        setUser(data.user);
        setCartItems(data.user.cartItems || {});
        return data.user;
      } else {
        setUser(null);
        return null;
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      setUser(null);
      return null;
    }
  }

  // Fetch products
  const fetchProducts = async () => {
    try {
      const {data} = await axios.get("/api/product/list")
      if(data.success){
        setProducts(data.products)
      } else {
        toast.error(data.message)
      }
    } catch(error) {
      toast.error(error.message)
    }
  };

  // Add to cart
  const addToCart = (itemId) => {
    if (!user) {
      setShowLogin(true);
      toast.error('Please login to add items to cart');
      return;
    }
    
    let cartData = structuredClone(cartItems);
    if (cartData[itemId]) {
      cartData[itemId] += 1;
    } else {
      cartData[itemId] = 1;
    }
    setCartItems(cartData);
    toast.success("Added to Cart");
  };

  // Update cart quantity
  const updateCart = (itemId, quantity) => {
    let cartData = structuredClone(cartItems);
    if (quantity <= 0) {
      delete cartData[itemId];
    } else {
      cartData[itemId] = quantity;
    }
    setCartItems(cartData);
  };

  // Remove product from cart completely
  const removeFromCart = (itemId) => {
    let cartData = structuredClone(cartItems);
    if (cartData[itemId]) {
      delete cartData[itemId];
      setCartItems(cartData);
      toast.success("Removed from Cart");
    }
  };

  const getcount = () => {
    let totalcount = 0;
    for (const item in cartItems) {
      totalcount += cartItems[item];
    }
    return totalcount;
  };

  const gettotal = () => {
    let totalAmount = 0;
    for (const itemId in cartItems) {
      let itemInfo = products.find((pro) => pro._id === itemId);
      if (itemInfo && cartItems[itemId] > 0) {
        totalAmount += itemInfo.offerPrice * cartItems[itemId];
      }
    }
    return Math.floor(totalAmount * 100) / 100;
  };

  // Logout function
  const logout = async () => {
    try {
      await axios.post('/api/user/logout');
      localStorage.removeItem('token');
      setUser(null);
      setCartItems({});
      toast.success('Logged out successfully');
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  useEffect(() => {
    fetchSeller();
    fetchUser();
    fetchProducts();
  }, []);

  // Update cart in database
  useEffect(() => {
    const updateCartInDB = async () => {
      try {
        if (user && user._id) {
          const { data } = await axios.post('/api/cart/update', {
            userId: user._id,
            cartItems
          });
          if (!data.success) {
            toast.error(data.message);
          }
        }
      } catch (error) {
        console.error('Cart update error:', error);
      }
    };

    if(user && Object.keys(cartItems).length > 0) {
      updateCartInDB();
    }
  }, [cartItems, user]);

  const value = {
    navigate,
    user,
    setUser,
    isSeller,
    setIsSeller,
    showLogin,
    setShowLogin,
    products,
    addToCart,
    updateCart,
    removeFromCart,
    cartItems,
    search,
    setSearch,
    getcount,
    gettotal,
    axios,
    fetchProducts,
    setCartItems,
    fetchUser, // Export fetchUser
    logout // Export logout
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  return useContext(AppContext);
};