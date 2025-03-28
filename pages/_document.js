import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <title>ChainCode Consulting - TimeHub</title>
        <link rel="icon" href="/favicon.ico" />
        {/* If using PNG or SVG */}
        <link rel="icon" type="image/png" href="/logo.png" />  
      </Head>
      <body className="antialiased">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
