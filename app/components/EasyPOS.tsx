'use client';

import React, { useState } from 'react';
import { ShoppingCart, Trash2, Printer, DollarSign, Edit2 } from 'lucide-react';

type CartItem = {
  id: number;
  name: string;
  price: number;
  quantity: number;
};

type Receipt = {
  id: number;
  company: string;
  date: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  taxRate: number;
  tax: number;
  total: number;
};

export default function EasyPOS() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [productName, setProductName] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [discount, setDiscount] = useState(0);
  const [taxRate, setTaxRate] = useState(10); // default 10%
  const [companyName, setCompanyName] = useState('My Company');
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastReceipt, setLastReceipt] = useState<Receipt | null>(null);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');
  const [editingCompany, setEditingCompany] = useState(false);

  // --- Cart Actions ---
  const addToCart = () => {
    if (!productName || !price || !quantity) return;

    const item: CartItem = {
      id: Date.now(),
      name: productName,
      price: parseFloat(price),
      quantity: parseInt(quantity),
    };

    setCart([...cart, item]);
    setProductName('');
    setPrice('');
    setQuantity('');
  };

  const removeFromCart = (id: number) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const startEditItem = (item: CartItem) => {
    setEditingId(item.id);
    setEditValue(item.name);
  };

  const handleEditItemName = (id: number) => {
    if (editValue.trim() === '') return;
    setCart(cart.map(item => (item.id === id ? { ...item, name: editValue } : item)));
    setEditingId(null);
    setEditValue('');
  };

  const handleEditItemQuantity = (id: number, qty: number) => {
    setCart(cart.map(item => (item.id === id ? { ...item, quantity: qty } : item)));
  };

  // --- Calculations ---
  const calculateSubtotal = () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const calculateDiscount = () => (calculateSubtotal() * discount) / 100;
  const calculateTax = () => (calculateSubtotal() - calculateDiscount()) * (taxRate / 100);
  const calculateTotal = () => calculateSubtotal() - calculateDiscount() + calculateTax();

  // --- Payment / Receipt ---
  const processPayment = () => {
    if (cart.length === 0) return;

    const now = new Date().toLocaleString();
    const receipt: Receipt = {
      id: Date.now(),
      company: companyName,
      date: now,
      items: [...cart],
      subtotal: calculateSubtotal(),
      discount: calculateDiscount(),
      taxRate,
      tax: calculateTax(),
      total: calculateTotal(),
    };

    setLastReceipt(receipt);
    setShowReceipt(true);
    setCart([]);
    setDiscount(0);
  };

  const printReceipt = () => window.print();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto p-6 max-w-5xl">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6 flex items-center gap-3">
          <ShoppingCart className="w-10 h-10 text-indigo-600" />
          <h1 className="text-3xl font-bold text-gray-800">EasyPOS</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Product Form */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Add Product</h2>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Product Name"
                value={productName}
                onChange={e => setProductName(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
              <input
                type="number"
                placeholder="Price"
                step="0.01"
                value={price}
                onChange={e => setPrice(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
              <input
                type="number"
                placeholder="Quantity"
                value={quantity}
                onChange={e => setQuantity(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
              <button
                onClick={addToCart}
                className="w-full py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium"
              >
                Add to Cart
              </button>
            </div>

            {/* Discount */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <label className="block text-sm font-medium text-gray-700">Discount (%)</label>
              <input
                type="number"
                min={0}
                max={100}
                value={discount}
                onChange={e => setDiscount(Math.max(0, Math.min(100, parseFloat(e.target.value) || 0)))}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 mt-1"
              />
            </div>

            {/* Tax */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700">Tax Rate (%)</label>
              <input
                type="number"
                min={0}
                max={100}
                value={taxRate}
                onChange={e => setTaxRate(Math.max(0, Math.min(100, parseFloat(e.target.value) || 0)))}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 mt-1"
              />
            </div>
          </div>

          {/* Cart */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">Cart ({cart.length} items)</h2>
            <div className="max-h-96 overflow-y-auto space-y-2 mb-4">
              {cart.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                  <ShoppingCart className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>No items in cart</p>
                </div>
              )}

              {cart.map(item => (
                <div key={item.id} className="flex justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100">
                  <div className="flex-1">
                    {editingId === item.id ? (
                      <input
                        type="text"
                        value={editValue}
                        onChange={e => setEditValue(e.target.value)}
                        onBlur={() => handleEditItemName(item.id)}
                        autoFocus
                        className="px-2 py-1 border rounded focus:ring-2 focus:ring-indigo-500"
                      />
                    ) : (
                      <h4
                        className="font-medium cursor-pointer flex items-center gap-2"
                        onDoubleClick={() => startEditItem(item)}
                      >
                        {item.name} <Edit2 className="w-3 h-3 text-gray-400" />
                      </h4>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      <span>${item.price.toFixed(2)}</span>
                      <input
                        type="number"
                        value={item.quantity}
                        min={1}
                        onChange={e => handleEditItemQuantity(item.id, parseInt(e.target.value) || 1)}
                        className="w-16 px-2 py-1 border rounded focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="p-2 bg-red-100 text-red-600 rounded hover:bg-red-200"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="border-t-2 border-gray-200 pt-4 space-y-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>${calculateSubtotal().toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount ({discount}%):</span>
                  <span>-${calculateDiscount().toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Tax ({taxRate}%):</span>
                <span>${calculateTax().toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xl font-bold pt-2 border-t-2">
                <span>Total:</span>
                <span>${calculateTotal().toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={processPayment}
              disabled={cart.length === 0}
              className="w-full mt-6 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 font-bold flex items-center justify-center gap-2 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              <DollarSign className="w-7 h-7" />
              Complete Sale
            </button>
          </div>
        </div>

        {/* Receipt Modal */}
        {showReceipt && lastReceipt && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6" id="receipt">
              <div className="text-center mb-4">
                {editingCompany ? (
                  <input
                    type="text"
                    value={companyName}
                    onChange={e => setCompanyName(e.target.value)}
                    onBlur={() => setEditingCompany(false)}
                    autoFocus
                    className="border px-2 py-1 rounded focus:ring-2 focus:ring-indigo-500"
                  />
                ) : (
                  <h2
                    className="text-2xl font-bold cursor-pointer"
                    onDoubleClick={() => setEditingCompany(true)}
                  >
                    {companyName}
                  </h2>
                )}
                <p className="text-gray-600 text-sm">Receipt #{lastReceipt.id}</p>
                <p className="text-gray-600 text-sm">{lastReceipt.date}</p>
              </div>

              <div className="border-t-2 border-b-2 border-dashed py-2 mb-4">
                {lastReceipt.items.map(item => (
                  <div key={item.id} className="flex justify-between text-sm mb-1">
                    <div className="flex-1">
                      <div>{item.name}</div>
                      <div className="text-gray-600">${item.price.toFixed(2)} × {item.quantity}</div>
                    </div>
                    <div>${(item.price * item.quantity).toFixed(2)}</div>
                  </div>
                ))}
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>${lastReceipt.subtotal.toFixed(2)}</span>
                </div>
                {lastReceipt.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount:</span>
                    <span>-${lastReceipt.discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Tax ({lastReceipt.taxRate}%):</span>
                  <span>${lastReceipt.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xl font-bold border-t-2 pt-2">
                  <span>Total:</span>
                  <span>${lastReceipt.total.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={printReceipt}
                  className="flex-1 py-3 bg-indigo-600 text-white rounded hover:bg-indigo-700 flex items-center justify-center gap-2"
                >
                  <Printer className="w-5 h-5" /> Print Receipt
                </button>
                <button
                  onClick={() => setShowReceipt(false)}
                  className="flex-1 py-3 bg-gray-200 rounded hover:bg-gray-300"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Print Styles */}
      <style jsx>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #receipt,
          #receipt * {
            visibility: visible;
          }
          #receipt {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
