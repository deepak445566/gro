import React, { useEffect, useState } from 'react'
import { assets } from '../assets/assets'
import { useAppContext } from '../context/AppContext'
import toast from 'react-hot-toast';

const InputField = ({ type, placeholder, name, handleChange, address }) => (
  <input 
    className='w-full px-2 py-2.5 border border-gray-500/30 rounded outline-none text-gray-500 focus:border-primary transition' 
    type={type}
    placeholder={placeholder}
    onChange={handleChange}
    name={name}
    value={address[name] || ''}
    required
  />
)

function Addaddress() {
  const { axios, user, navigate } = useAppContext();
  
  const [address, setAddress] = useState({
    firstname: "",
    lastname: "",
    email: "",
    street: "",
    city: "",
    state: "",
    zipcode: "",
    country: "",
    phone: ""
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAddress((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Validate form function
  const validateForm = () => {
    const requiredFields = ['firstname', 'lastname', 'email', 'street', 'city', 'state', 'zipcode', 'country', 'phone'];
    
    // Check for empty fields
    for (let field of requiredFields) {
      if (!address[field]?.trim()) {
        toast.error(`Please fill in ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
        return false;
      }
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(address.email)) {
      toast.error('Please enter a valid email address');
      return false;
    }
    
    // Phone validation (basic)
    if (address.phone.length < 10) {
      toast.error('Please enter a valid phone number');
      return false;
    }
    
    return true;
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Please login to add address');
      navigate('/login');
      return;
    }
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    console.log('=== FORM SUBMISSION DEBUG ===');
    console.log('User ID:', user?._id);
    console.log('Address Data:', address);
    
    try {
      console.log('Making API call to /api/address/add');
      
      // Try both structures - one might work based on your backend
      const requestData = {
        // Option 1: Nested address structure
        address: address,
        userId: user._id
        
        // Option 2: Flat structure (uncomment if above doesn't work)
        // ...address,
        // userId: user._id
      };
      
      console.log('Request Data:', requestData);
      
      const { data } = await axios.post('/api/address/add', requestData, {
        headers: {
          'Content-Type': 'application/json',
        }
      });

      console.log('API Response:', data);

      if (data.success) {
        toast.success(data.message || 'Address added successfully!');
        navigate("/cart");
      } else {
        toast.error(data.message || 'Failed to add address');
      }
    } catch (error) {
      console.error('=== API ERROR DETAILS ===');
      console.error('Full Error:', error);
      console.error('Response Data:', error.response?.data);
      console.error('Status Code:', error.response?.status);
      console.error('Headers:', error.response?.headers);
      
      let errorMessage = 'Failed to add address';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      } else if (error.response?.status === 401) {
        errorMessage = 'Please login again';
      } else if (error.response?.status === 400) {
        errorMessage = 'Invalid address data';
      } else if (error.response?.status === 500) {
        errorMessage = 'Server error. Please try again later.';
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Alternative API call function if the main one doesn't work
  const onSubmitHandlerAlternative = async (e) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Please login to add address');
      return;
    }
    
    setLoading(true);
    
    try {
      // Alternative: Send flat structure
      const requestData = {
        firstname: address.firstname,
        lastname: address.lastname,
        email: address.email,
        street: address.street,
        city: address.city,
        state: address.state,
        zipcode: address.zipcode,
        country: address.country,
        phone: address.phone,
        userId: user._id
      };
      
      console.log('Alternative Request Data:', requestData);
      
      const { data } = await axios.post('/api/address/create', requestData); // Try different endpoint
      
      if (data.success) {
        toast.success('Address added successfully!');
        navigate("/cart");
      }
    } catch (error) {
      console.error('Alternative method failed:', error);
      toast.error('Failed to add address. Please check console for details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      toast.error('Please login to add address');
      navigate("/cart");
    }
  }, [user, navigate]);

  // Test connection on component mount
  useEffect(() => {
    const testConnection = async () => {
      try {
        const response = await axios.get('/api/health'); // Or any test endpoint
        console.log('Backend connection:', response.status);
      } catch (error) {
        console.warn('Backend connection test failed:', error.message);
      }
    };
    
    testConnection();
  }, [axios]);

  return (
    <>
      <div className="mt-10 pb-16">
        <p className="text-2xl md:text-3xl text-gray-500">
          Add Shipping <span className="font-semibold text-primary">Address</span>
        </p>

        <div className="flex flex-col-reverse md:flex-row justify-between mt-10">
          <div className="flex-1 max-w-md">
            <form onSubmit={onSubmitHandler} className='space-y-3 mt-6 text-sm'>
              <div className='grid grid-cols-2 gap-4'>
                <InputField 
                  handleChange={handleChange} 
                  address={address} 
                  name="firstname" 
                  type="text" 
                  placeholder="Enter First Name" 
                />
                <InputField 
                  handleChange={handleChange} 
                  address={address} 
                  name="lastname" 
                  type="text" 
                  placeholder="Enter Last Name" 
                />
              </div>
              
              <InputField 
                handleChange={handleChange} 
                address={address} 
                name="email" 
                type="email" 
                placeholder="Enter Email" 
              />
              
              <InputField 
                handleChange={handleChange} 
                address={address} 
                name="street" 
                type="text" 
                placeholder="Street Address" 
              />
              
              <div className='grid grid-cols-2 gap-4'>
                <InputField 
                  handleChange={handleChange} 
                  address={address} 
                  name="city" 
                  type="text" 
                  placeholder="City" 
                />
                <InputField 
                  handleChange={handleChange} 
                  address={address} 
                  name="state" 
                  type="text" 
                  placeholder="State" 
                />
              </div>
              
              <div className='grid grid-cols-2 gap-4'>
                <InputField 
                  handleChange={handleChange} 
                  address={address} 
                  name="zipcode" 
                  type="number" 
                  placeholder="Zip Code" 
                />
                <InputField 
                  handleChange={handleChange} 
                  address={address} 
                  name="country" 
                  type="text" 
                  placeholder="Country" 
                />
              </div>
              
              <InputField 
                handleChange={handleChange} 
                address={address} 
                name="phone" 
                type="tel" 
                placeholder="Phone Number" 
              />

              <button 
                type="submit" 
                disabled={loading}
                className={`w-full mt-6 py-3 hover:bg-primary-dull transition uppercase ${
                  loading 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-primary text-white cursor-pointer'
                }`}
              >
                {loading ? 'Adding Address...' : 'Save Address'}
              </button>

              {/* Debug button - remove in production */}
              <button 
                type="button"
                onClick={() => {
                  console.log('Current address state:', address);
                  console.log('User:', user);
                }}
                className="w-full mt-2 py-2 bg-gray-500 text-white rounded"
              >
                Debug Log
              </button>
            </form>
          </div>

          <img
            className="md:mr-16 mb-16 md:mt-0 w-full max-w-sm"
            src={assets.add_address_iamge}
            alt="Add Address Illustration"
          />
        </div>
      </div>
    </>
  );
}

export default Addaddress;