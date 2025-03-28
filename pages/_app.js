import "@/styles/globals.css";
import Layout from "../components/Layout";
import { Toaster } from "react-hot-toast";
import React from 'react';
import { Provider } from "react-redux";
import { store } from "../store";
import Head from "next/head";

export default function App({ Component, pageProps }) {
  return (
    <Provider store={store}>
      <Head>
        <title>ChainCode Consulting - TimeHub</title>
        {/* <link rel="icon" href="/favicon.ico" /> */}
        {/* If using PNG or SVG */}
        <link rel="icon" type="image/png" href="/logo.png" />
      </Head>
      <Layout>
        <Toaster position="top-right" />
        <Component {...pageProps} />
      </Layout>
    </Provider>
  );
}
