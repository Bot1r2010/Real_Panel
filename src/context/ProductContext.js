'use client';

import { createContext, useContext, useState } from 'react';

const ProductContext = createContext();

export function ProductProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);

  return (
    <ProductContext.Provider value={{ products, setProducts, selectedProduct, setSelectedProduct }}>
      {children}
    </ProductContext.Provider>
  );
}

export const useProduct = () => useContext(ProductContext);
