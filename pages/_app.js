import "@/styles/globals.css";
import Layout from "../components/Layout";
import { Toaster } from "react-hot-toast";
import React from 'react';
import { Provider } from "react-redux";
import store from "../store";
export default function App({ Component, pageProps }) {
  return (
    <Provider store={store}>
    <Layout>
      <Toaster position="top-right" />
      <Component {...pageProps} />
    </Layout>
    </Provider>
  )
}