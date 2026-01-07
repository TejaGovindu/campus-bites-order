export interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
  subCategory?: string;
  isVeg: boolean;
}

export const menuData: MenuItem[] = [
  // BIRYANIS
  { id: 'b1', name: 'HYD Dum Biryani', price: 140, category: 'Biryanis', isVeg: false },
  { id: 'b2', name: 'Fry Piece Biryani', price: 150, category: 'Biryanis', isVeg: false },
  { id: 'b3', name: 'Guntur Biryani', price: 150, category: 'Biryanis', isVeg: false },
  { id: 'b4', name: 'Paneer Tikka Biryani', price: 160, category: 'Biryanis', isVeg: true },
  { id: 'b5', name: 'Gongura Biryani', price: 160, category: 'Biryanis', isVeg: false },
  { id: 'b6', name: 'Lollipop Biryani', price: 160, category: 'Biryanis', isVeg: false },
  { id: 'b7', name: 'Prawns / Fish Biryani', price: 180, category: 'Biryanis', isVeg: false },
  { id: 'b8', name: 'Mughalai Chicken Biryani', price: 150, category: 'Biryanis', isVeg: false },
  { id: 'b9', name: 'Campus Tales Special Biryani', price: 180, category: 'Biryanis', isVeg: false },
  { id: 'b10', name: 'Veg Biryani', price: 130, category: 'Biryanis', isVeg: true },
  { id: 'b11', name: 'Egg Biryani', price: 100, category: 'Biryanis', isVeg: false },
  { id: 'b12', name: 'Paneer Biryani', price: 140, category: 'Biryanis', isVeg: true },
  { id: 'b13', name: 'Kabab Piece Biryani', price: 150, category: 'Biryanis', isVeg: false },
  { id: 'b14', name: 'Kaju Biryani', price: 160, category: 'Biryanis', isVeg: true },

  // NON-VEG STARTERS
  { id: 'ns1', name: 'Sholay Kabab', price: 150, category: 'Non-Veg Starters', subCategory: 'Starters', isVeg: false },
  { id: 'ns2', name: 'Chicken Majestic', price: 160, category: 'Non-Veg Starters', subCategory: 'Starters', isVeg: false },
  { id: 'ns3', name: 'Dragon Chicken', price: 160, category: 'Non-Veg Starters', subCategory: 'Starters', isVeg: false },
  { id: 'ns4', name: 'Chilli Chicken', price: 150, category: 'Non-Veg Starters', subCategory: 'Starters', isVeg: false },
  { id: 'ns5', name: 'Chicken 65', price: 160, category: 'Non-Veg Starters', subCategory: 'Starters', isVeg: false },
  { id: 'ns6', name: 'Pepper Chicken', price: 160, category: 'Non-Veg Starters', subCategory: 'Starters', isVeg: false },
  { id: 'ns7', name: 'Kaju Chicken', price: 160, category: 'Non-Veg Starters', subCategory: 'Starters', isVeg: false },
  { id: 'ns8', name: 'Chicken Lollipop', price: 160, category: 'Non-Veg Starters', subCategory: 'Starters', isVeg: false },
  { id: 'ns9', name: 'Lemon Chicken', price: 150, category: 'Non-Veg Starters', subCategory: 'Starters', isVeg: false },
  { id: 'ns10', name: 'Garlic Chicken', price: 150, category: 'Non-Veg Starters', subCategory: 'Starters', isVeg: false },
  { id: 'ns11', name: 'Fried Prawns', price: 180, category: 'Non-Veg Starters', subCategory: 'Starters', isVeg: false },
  { id: 'ns12', name: 'Chilli Prawns / Fish', price: 180, category: 'Non-Veg Starters', subCategory: 'Starters', isVeg: false },

  // VEG STARTERS
  { id: 'vs1', name: 'Gobi Manchurian', price: 90, category: 'Veg Starters', isVeg: true },
  { id: 'vs2', name: 'Mushroom Manchurian', price: 100, category: 'Veg Starters', isVeg: true },
  { id: 'vs3', name: 'Babycorn Manchurian', price: 120, category: 'Veg Starters', isVeg: true },
  { id: 'vs4', name: 'Veg Ball Manchurian', price: 120, category: 'Veg Starters', isVeg: true },
  { id: 'vs5', name: 'Paneer Chilli', price: 140, category: 'Veg Starters', isVeg: true },
  { id: 'vs6', name: 'Baby Corn Chilli', price: 120, category: 'Veg Starters', isVeg: true },
  { id: 'vs7', name: 'Gobi 65', price: 90, category: 'Veg Starters', isVeg: true },
  { id: 'vs8', name: 'Mushroom 65', price: 100, category: 'Veg Starters', isVeg: true },
  { id: 'vs9', name: 'Baby Corn 65', price: 120, category: 'Veg Starters', isVeg: true },
  { id: 'vs10', name: 'Paneer 65', price: 140, category: 'Veg Starters', isVeg: true },

  // NON-VEG MAIN COURSE
  { id: 'nmc1', name: 'Chicken Kolhapuri', price: 170, category: 'Non-Veg Main Course', subCategory: 'Curries', isVeg: false },
  { id: 'nmc2', name: 'Chicken Masala', price: 160, category: 'Non-Veg Main Course', subCategory: 'Curries', isVeg: false },
  { id: 'nmc3', name: 'Butter Chicken', price: 170, category: 'Non-Veg Main Course', subCategory: 'Curries', isVeg: false },
  { id: 'nmc4', name: 'Kadai Chicken', price: 150, category: 'Non-Veg Main Course', subCategory: 'Curries', isVeg: false },
  { id: 'nmc5', name: 'Guntur Chicken Curry', price: 150, category: 'Non-Veg Main Course', subCategory: 'Curries', isVeg: false },
  { id: 'nmc6', name: 'Egg Masala', price: 100, category: 'Non-Veg Main Course', subCategory: 'Curries', isVeg: false },
  { id: 'nmc7', name: 'Punjabi Chicken Curry', price: 180, category: 'Non-Veg Main Course', subCategory: 'Curries', isVeg: false },
  { id: 'nmc8', name: 'Chicken Mughalai', price: 160, category: 'Non-Veg Main Course', subCategory: 'Curries', isVeg: false },
  { id: 'nmc9', name: 'Chicken Roast', price: 170, category: 'Non-Veg Main Course', subCategory: 'Curries', isVeg: false },
  { id: 'nmc10', name: 'Prawns Curry', price: 180, category: 'Non-Veg Main Course', subCategory: 'Curries', isVeg: false },

  // VEG MAIN COURSE
  { id: 'vmc1', name: 'Paneer Butter Masala', price: 160, category: 'Veg Main Course', isVeg: true },
  { id: 'vmc2', name: 'Kadai Paneer', price: 130, category: 'Veg Main Course', isVeg: true },
  { id: 'vmc3', name: 'Kaju Masala', price: 160, category: 'Veg Main Course', isVeg: true },
  { id: 'vmc4', name: 'Mushroom Masala', price: 160, category: 'Veg Main Course', isVeg: true },
  { id: 'vmc5', name: 'Palak Paneer', price: 150, category: 'Veg Main Course', isVeg: true },
  { id: 'vmc6', name: 'Veg Kurma', price: 160, category: 'Veg Main Course', isVeg: true },
  { id: 'vmc7', name: 'Veg Jalfrezi', price: 150, category: 'Veg Main Course', isVeg: true },

  // BREADS
  { id: 'br1', name: 'Tandoori Roti', price: 15, category: 'Breads', isVeg: true },
  { id: 'br2', name: 'Butter Roti', price: 20, category: 'Breads', isVeg: true },
  { id: 'br3', name: 'Plain Naan', price: 25, category: 'Breads', isVeg: true },
  { id: 'br4', name: 'Butter Naan', price: 30, category: 'Breads', isVeg: true },
  { id: 'br5', name: 'Garlic Naan', price: 30, category: 'Breads', isVeg: true },
  { id: 'br6', name: 'Rumali Roti', price: 20, category: 'Breads', isVeg: true },

  // CHINESE / RICE & NOODLES
  { id: 'ch1', name: 'Veg Fried Rice', price: 90, category: 'Chinese', isVeg: true },
  { id: 'ch2', name: 'Chicken Fried Rice', price: 120, category: 'Chinese', isVeg: false },
  { id: 'ch3', name: 'Egg Fried Rice', price: 90, category: 'Chinese', isVeg: false },
  { id: 'ch4', name: 'Gobi Fried Rice', price: 90, category: 'Chinese', isVeg: true },
  { id: 'ch5', name: 'Veg Noodles', price: 90, category: 'Chinese', isVeg: true },
  { id: 'ch6', name: 'Chicken Noodles', price: 120, category: 'Chinese', isVeg: false },
  { id: 'ch7', name: 'Schezwan Fried Rice (Veg)', price: 100, category: 'Chinese', isVeg: true },
  { id: 'ch8', name: 'Schezwan Fried Rice (Non-Veg)', price: 130, category: 'Chinese', isVeg: false },

  // EVENING NIBBLES
  { id: 'en1', name: 'Tea', price: 15, category: 'Evening Nibbles', isVeg: true },
  { id: 'en2', name: 'Coffee', price: 15, category: 'Evening Nibbles', isVeg: true },
  { id: 'en3', name: 'Milk', price: 15, category: 'Evening Nibbles', isVeg: true },
  { id: 'en4', name: 'Maggie', price: 50, category: 'Evening Nibbles', isVeg: true },
  { id: 'en5', name: 'Egg Maggie', price: 60, category: 'Evening Nibbles', isVeg: false },
];

export const categories = [
  { id: 'veg-starters', name: 'Veg Starters', icon: '🥗', color: 'veg' },
  { id: 'non-veg-starters', name: 'Non-Veg Starters', icon: '🍗', color: 'nonveg' },
  { id: 'biryanis', name: 'Biryanis', icon: '🍛', color: 'primary' },
  { id: 'veg-main', name: 'Veg Main Course', icon: '🥘', color: 'veg' },
  { id: 'non-veg-main', name: 'Non-Veg Main Course', icon: '🍖', color: 'nonveg' },
  { id: 'chinese', name: 'Chinese', icon: '🥡', color: 'primary' },
  { id: 'breads', name: 'Breads', icon: '🫓', color: 'primary' },
  { id: 'evening', name: 'Evening Nibbles', icon: '☕', color: 'primary' },
];

export const getCategoryItems = (categoryId: string): MenuItem[] => {
  const categoryMap: Record<string, string> = {
    'veg-starters': 'Veg Starters',
    'non-veg-starters': 'Non-Veg Starters',
    'biryanis': 'Biryanis',
    'veg-main': 'Veg Main Course',
    'non-veg-main': 'Non-Veg Main Course',
    'chinese': 'Chinese',
    'breads': 'Breads',
    'evening': 'Evening Nibbles',
  };
  
  return menuData.filter(item => item.category === categoryMap[categoryId]);
};
