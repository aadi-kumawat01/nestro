"use client";
import { useEffect, useState } from "react";
import { Provider, useDispatch, useSelector } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import cartReducer, { bootstrapCart } from "./fetures/cartSlice";
import wishlistReducer from "./fetures/wishlistSlice";
export default function StoreProvider({ children }) {
  const [store] = useState(() =>
    configureStore({
      reducer: { cart: cartReducer, wishlist: wishlistReducer },
    }),
  );

  useEffect(() => {
    store.dispatch(bootstrapCart());
  }, [store]);
  return (
    <Provider store={store}>
      <CartStatus />
      {children}
    </Provider>
  );
}
function CartStatus() {
  const error = useSelector((s) => s.cart.error),
    dispatch = useDispatch();
  return error ? (
    <div
      role="alert"
      className="fixed bottom-3 left-3 right-3 z-[10000] bg-amber-100 text-amber-950 border rounded p-3"
    >
      {error}{" "}
      <button className="underline" onClick={() => dispatch(bootstrapCart())}>
        Retry
      </button>
    </div>
  ) : null;
}
