import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const apiSlice = createApi({

  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: 'https://timehub-api.chaincodeconsulting.com/',
    prepareHeaders: (headers) => {
      const token = sessionStorage.getItem('token'); 
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Employee'], //  Define tag type for cache invalidation
  endpoints: (builder) => ({
    getPosts: builder.query({
      query: () => 'employees',
      providesTags: ['Employee'], // Caches responses with this tag 
    }),
    addEmployee: builder.mutation({
      query: (formData) => ({
        url: 'employees',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['Employee'], // Clears cache when adding a new employee
    }),
    deletePost: builder.mutation({
      query: (id) => ({
        url: `employees/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Employee'], // 🔹 Clears cache when deleting a employee
    }),
  }),
});

export const { useGetPostsQuery, useAddEmployeeMutation, useDeletePostMutation } = apiSlice;

