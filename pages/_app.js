import "@/styles/globals.css";
import Layout from "../components/Layout";
import { Toaster } from "react-hot-toast";
import React from 'react';

export default function App({ Component, pageProps }) {
  return (
    <Layout>
      <Toaster position="top-right" />
      <Component {...pageProps} />
    </Layout>
  )
}