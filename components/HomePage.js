import React from "react";
import Link from "next/link";
import { 
  Users, 
  Clock, 
  Calendar, 
  Download,
  Code,
  ArrowRight,
  Shield,
  BarChart3
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function EnhancedLandingPage() {
  const features = [
    {
      icon: <Users className="w-6 h-6 text-blue-600" />,
      title: "Team Management",
      description: "Comprehensive profile and role assignment system"
    },
    {
      icon: <Clock className="w-6 h-6 text-blue-600" />,
      title: "Time Tracking",
      description: "Precise attendance with real-time monitoring"
    },
    {
      icon: <Download className="w-6 h-6 text-blue-600" />,
      title: "Export Reports",
      description: "One-click payroll-ready data exports"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-white flex items-center justify-center overflow-hidden relative">
      {/* Background decorative elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full opacity-5 -mr-20 -mt-20"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-500 rounded-full opacity-5 -ml-40 -mb-40"></div>
      
      <div className="container max-w-6xl mx-auto p-8 z-10">
        <div className="flex flex-col items-center mb-10">
          <div className="flex items-center mb-4">
            <div className="h-14 w-14 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center mr-4 shadow-lg">
              <Code className="text-white" size={28} />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Chaincode Consulting
              </h1>
              <p className="text-gray-600 text-lg">Employee Management System</p>
            </div>
          </div>
          <p className="text-gray-700 text-center max-w-2xl text-lg mb-4">
            A powerful platform designed to streamline workforce management and boost productivity
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {features.map((feature, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:border-blue-200 transition-all duration-300 hover:shadow-xl group">
              <div className="flex items-center mb-4">
                <div className="bg-blue-50 p-3 rounded-lg mr-4 group-hover:bg-blue-100 transition-colors">
                  {feature.icon}
                </div>
                <h3 className="font-bold text-lg text-gray-800">{feature.title}</h3>
              </div>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
        
        <div className="flex justify-center mt-6">
          <Link href="/manage-emp">
            <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-10 py-6 rounded-xl text-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 group">
              Management Console
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}