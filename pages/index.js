import React from "react";
import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6">
      <div className="w-full max-w-5xl bg-white rounded-lg shadow-2xl overflow-hidden flex flex-col md:flex-row">
  
        <div className="w-full md:w-1/2 p-8 flex flex-col justify-center">
          <h1 className="text-4xl font-extrabold text-gray-800 mb-4">
            Simplified Employee Management
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Track, manage, and organize employees efficiently with our streamlined interface.
          </p>
          <div className="flex gap-4">
            <Link href="/manage-emp">
              <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg shadow-lg transition-transform transform hover:scale-105">
                Login
              </button>
            </Link>
            <Link href="/add-emp">
              <button className="bg-gray-700 hover:bg-gray-800 text-white font-semibold py-3 px-6 rounded-lg shadow-lg transition-transform transform hover:scale-105">
                Add Employee
              </button>
            </Link>
          </div>
        </div>

        <div className="w-full md:w-1/2 relative">
          <Image
            src="/bg.jpg"
            alt="Employee Management"
            fill
            className="object-cover h-full w-full"
            priority
          />
        </div>
      </div>
    </div>
  );
}
