import { useState } from 'react';
import * as Yup from "yup";
import { Formik, Form, Field, ErrorMessage } from "formik";
export const FormPane = ({ isOpen, onClose, onSubmit }) => {
    
      const validationSchema = Yup.object({
            first_name: Yup.string().required("First Name is required").max(20, "Must be 20 characters or less"),
            last_name: Yup.string().required("Last Name is required"),
            email: Yup.string().email("Invalid email format").required("Email is required").max(50,"Must be 50 characters or less"),
            avatar: Yup.string().url("Invalid URL"),
            department: Yup.string().required("Department is required").max(20, "Must be 20 characters or less"),
            role: Yup.string().required("Role is required").max(20, "Must be 20 characters or less"),
        });
    
    return (
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-50 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-medium text-gray-700">Onboarding form</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
  
          <Formik
            initialValues={{
              first_name: "",
              last_name: "",
              email: "",
              avatar: "",
              department: "",
              role: "",
            }}
            validationSchema={validationSchema}
            onSubmit={(values, { resetForm }) => {
              onSubmit(values); // Ensure the correct values are passed
              resetForm(); // Reset form after submission
              onClose(); // Close the form
            }}
          >
            {() => (
              <Form className="space-y-4">
                <Field type="text" name="first_name" placeholder="First Name" className="w-full p-2 border rounded-lg" />
                <ErrorMessage name="first_name" component="div" className="text-red-500 text-sm" />
  
                <Field type="text" name="last_name" placeholder="Last Name" className="w-full p-2 border rounded-lg" />
                <ErrorMessage name="last_name" component="div" className="text-red-500 text-sm" />
  
                <Field type="email" name="email" placeholder="Email" className="w-full p-2 border rounded-lg" />
                <ErrorMessage name="email" component="div" className="text-red-500 text-sm" />
  
                <Field type="text" name="avatar" placeholder="Avatar URL" className="w-full p-2 border rounded-lg" />
                <ErrorMessage name="avatar" component="div" className="text-red-500 text-sm" />
  
                <Field type="text" name="department" placeholder="Department" className="w-full p-2 border rounded-lg" />
                <ErrorMessage name="department" component="div" className="text-red-500 text-sm" />
  
                <Field type="text" name="role" placeholder="Role" className="w-full p-2 border rounded-lg" />
                <ErrorMessage name="role" component="div" className="text-red-500 text-sm" />
  
                <button type="submit" className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 rounded-lg">
                  Submit
                </button>
              </Form>
            )}
          </Formik>
        </div> 
    </div>
  );
};