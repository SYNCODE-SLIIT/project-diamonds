import React, { useState, useMemo } from 'react';
import { 
  ShoppingCart, 
  Search, 
  Filter, 
  Star, 
  Heart, 
  ArrowRight 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Expanded Product Catalog+
const products = [
  // T-Shirts
  {
    id: 1,
    name: 'Vintage Band Logo T-Shirt',
    price: 25.99,
    image: '/api/placeholder/300/400',
    category: 'T-Shirts',
    brand: 'RockWear',
    description: 'Classic band logo tee with vintage print',
    colors: ['Black', 'White', 'Gray'],
    sizes: ['S', 'M', 'L', 'XL'],
    inStock: true,
    isNewArrival: true
  },
  {
    id: 2,
    name: 'Abstract Art T-Shirt',
    price: 29.99,
    image: '/api/placeholder/300/400',
    category: 'T-Shirts',
    brand: 'ArtWear',
    description: 'Unique abstract design printed on premium cotton',
    colors: ['Blue', 'Red', 'Green'],
    sizes: ['M', 'L', 'XL'],
    inStock: true,
    isNewArrival: true
  },
  // Shirts
  {
    id: 3,
    name: 'Vintage Flannel Shirt',
    price: 45.99,
    image: '/api/placeholder/300/450',
    category: 'Shirts',
    brand: 'WoodlandStyle',
    description: 'Authentic vintage-inspired flannel shirt',
    colors: ['Red Plaid', 'Blue Plaid', 'Green Plaid'],
    sizes: ['S', 'M', 'L', 'XL'],
    inStock: true,
    isNewArrival: true
  },
  // Mugs
  {
    id: 4,
    name: "Collector's Limited Edition Mug",
    price: 15.99,
    image: '/api/placeholder/300/300',
    category: 'Mugs',
    brand: 'ArtisanCup',
    description: 'Hand-crafted ceramic mug with unique design',
    colors: ['White', 'Black', 'Metallic Silver'],
    sizes: ['11oz', '15oz'],
    inStock: true,
    isNewArrival: true
  },
  // Band Merch
  {
    id: 5,
    name: 'Band Tour Poster',
    price: 35.99,
    image: '/api/placeholder/300/350',
    category: 'Band',
    brand: 'MusicLegends',
    description: 'Official limited edition tour poster',
    colors: ['Multicolor'],
    sizes: ['Medium', 'Large'],
    inStock: true,
    isNewArrival: true
  },
  // Stickers
  {
    id: 6,
    name: 'Artist Series Vinyl Sticker Pack',
    price: 10.99,
    image: '/api/placeholder/300/200',
    category: 'Stickers',
    brand: 'StickerArt',
    description: 'Curated collection of artistic vinyl stickers',
    variants: ['Logo Stickers', 'Art Stickers'],
    inStock: true,
    isNewArrival: true
  },
  // Additional Products to reach 15+
  {
    id: 7,
    name: 'Graphic Hoodie',
    price: 55.99,
    image: '/api/placeholder/300/400',
    category: 'T-Shirts',
    brand: 'UrbanWear',
    description: 'Comfortable graphic print hoodie',
    colors: ['Black', 'Gray', 'Navy'],
    sizes: ['M', 'L', 'XL'],
    inStock: true,
    isNewArrival: true
  },
  {
    id: 8,
    name: 'Minimalist Ceramic Mug',
    price: 18.99,
    image: '/api/placeholder/300/300',
    category: 'Mugs',
    brand: 'ModernCup',
    description: 'Sleek minimalist design coffee mug',
    colors: ['White', 'Black'],
    sizes: ['12oz'],
    inStock: true,
    isNewArrival: true
  },
  {
    id: 9,
    name: 'Music Festival Sticker Set',
    price: 12.99,
    image: '/api/placeholder/300/200',
    category: 'Stickers',
    brand: 'FestivalArt',
    description: 'Exclusive music festival sticker collection',
    variants: ['Concert Stickers'],
    inStock: true,
    isNewArrival: true
  },
  {
    id: 10,
    name: 'Vintage Band Snapback',
    price: 29.99,
    image: '/api/placeholder/300/250',
    category: 'Band',
    brand: 'RockStyle',
    description: 'Authentic vintage-style snapback cap',
    colors: ['Black', 'Denim Blue'],
    sizes: ['Adjustable'],
    inStock: true,
    isNewArrival: true
  },
  {
    id: 11,
    name: 'Artistic Printed Shirt',
    price: 39.99,
    image: '/api/placeholder/300/450',
    category: 'Shirts',
    brand: 'ArtWear',
    description: 'Hand-drawn artistic print on premium shirt',
    colors: ['White', 'Cream'],
    sizes: ['S', 'M', 'L'],
    inStock: true,
    isNewArrival: true
  },
  {
    id: 12,
    name: 'Limited Edition Collectible Mug',
    price: 24.99,
    image: '/api/placeholder/300/300',
    category: 'Mugs',
    brand: 'CollectorSeries',
    description: "Rare limited edition collector's mug",
    colors: ['Metallic Gold', 'Silver'],
    sizes: ['15oz'],
    inStock: true,
    isNewArrival: true
  },
  {
    id: 13,
    name: 'Band Logo Laptop Stickers',
    price: 8.99,
    image: '/api/placeholder/300/200',
    category: 'Stickers',
    brand: 'TechArt',
    description: 'Premium vinyl band logo laptop stickers',
    variants: ['Tech Stickers'],
    inStock: true,
    isNewArrival: true
  },
  {
    id: 14,
    name: 'Retro Concert T-Shirt',
    price: 34.99,
    image: '/api/placeholder/300/400',
    category: 'T-Shirts',
    brand: 'VintageRock',
    description: 'Authentic retro concert t-shirt design',
    colors: ['Faded Red', 'Vintage Black'],
    sizes: ['M', 'L', 'XL'],
    inStock: true,
    isNewArrival: true
  },
  {
    id: 15,
    name: 'Artistic Band Poster',
    price: 42.99,
    image: '/api/placeholder/300/350',
    category: 'Band',
    brand: 'ArtistCollection',
    description: 'Unique artistic interpretation of band imagery',
    colors: ['Multicolor'],
    sizes: ['Large'],
    inStock: true,
    isNewArrival: true
  }
];

const MerchandiseStore = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [priceRange, setPriceRange] = useState([0, 100]);
  const [cartItems, setCartItems] = useState([]);
  const navigate = useNavigate();

  // Filtering Logic
  const filteredProducts = useMemo(() => {
    return products.filter(product => 
      (selectedCategory === 'All' || product.category === selectedCategory) &&
      (product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
       product.description.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (product.price >= priceRange[0] && product.price <= priceRange[1])
    );
  }, [selectedCategory, searchTerm, priceRange]);

  const addToCart = (product) => {
    setCartItems([...cartItems, product]);
  };

  const categories = ['All', 'T-Shirts', 'Shirts', 'Mugs', 'Band', 'Stickers'];

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Top Navigation */}
      <nav className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="text-3xl font-bold text-gray-800">Merch Store</div>
          
          <div className="flex items-center space-x-6">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`
                  px-4 py-2 rounded-full transition-all
                  ${selectedCategory === category 
                    ? 'bg-blue-500 text-white' 
                    : 'hover:bg-blue-50 text-gray-700'}
                `}
              >
                {category}
              </button>
            ))}
            
            <div className="relative">
              <button className="bg-blue-500 text-white px-4 py-2 rounded-full flex items-center">
                <ShoppingCart className="mr-2" />
                Cart ({cartItems.length})
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-12 grid grid-cols-12 gap-8">
        {/* New Arrivals Section */}
        <div className="col-span-8 bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-3xl font-bold mb-4">New Arrivals</h2>
          <p className="text-gray-600 mb-6">
            Discover our latest collection of unique merchandise. From vintage-inspired designs to modern artistic expressions, we have something for every fan.
          </p>

          {/* Search and Filter */}
          <div className="mb-6 flex space-x-4">
            <div className="relative flex-grow">
              <input 
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 border rounded-full pl-10"
              />
              <Search className="absolute left-3 top-3.5 text-gray-400" />
            </div>

            <div className="flex items-center space-x-2">
              <label>Price:</label>
              <input 
                type="number" 
                value={priceRange[0]}
                onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                className="w-20 px-2 py-2 border rounded"
                placeholder="Min"
              />
              <span>-</span>
              <input 
                type="number"
                value={priceRange[1]}
                onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                className="w-20 px-2 py-2 border rounded"
                placeholder="Max"
              />
            </div>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-3 gap-6">
            {filteredProducts.map(product => (
              <div 
                key={product.id} 
                className="bg-gray-100 rounded-xl overflow-hidden shadow-md group"
              >
                <div className="relative">
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform"
                  />
                  <button 
                    onClick={() => addToCart(product)}
                    className="absolute top-2 right-2 bg-white p-2 rounded-full shadow-md"
                  >
                    <ShoppingCart className="text-blue-500" size={20} />
                  </button>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-lg truncate">{product.name}</h3>
                  <p className="text-gray-600 text-sm mb-2">{product.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-blue-600 font-bold">${product.price.toFixed(2)}</span>
                    <div className="flex items-center">
                      {[...Array(4)].map((_, i) => (
                        <Star key={i} className="text-yellow-400" size={16} fill="#FFD700" />
                      ))}
                      <span className="ml-2 text-gray-500">(24)</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* New Products Sidebar */}
        <div className="col-span-4 bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-2xl font-bold mb-6">Featured Products</h3>
          {products.slice(0, 5).map(product => (
            <div 
              key={product.id} 
              className="flex items-center mb-4 pb-4 border-b last:border-b-0"
            >
              <img 
                src={product.image} 
                alt={product.name} 
                className="w-20 h-20 object-cover rounded-lg mr-4"
              />
              <div>
                <h4 className="font-semibold">{product.name}</h4>
                <p className="text-blue-600 font-bold">${product.price.toFixed(2)}</p>
              </div>
              <button className="ml-auto bg-blue-500 text-white p-2 rounded-full">
                <Heart size={20} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Payment Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="bg-blue-600 text-white rounded-xl p-8 flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold mb-4">Ready to Complete Your Purchase?</h2>
            <p className="text-lg mb-4">Checkout now and get exclusive merchandise delivered to your doorstep!</p>
          </div>
          <button 
            onClick={() => navigate('/pform')}
            className="bg-white text-blue-600 px-8 py-4 rounded-full font-bold flex items-center hover:bg-blue-50 transition-colors"
          >
            Checkout Now <ArrowRight className="ml-2" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MerchandiseStore;
