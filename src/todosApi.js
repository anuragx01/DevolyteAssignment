import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const todosApi = createApi({
  reducerPath: 'todosApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  tagTypes: ['Todo'],
  endpoints: (builder) => ({
    getTodos: builder.query({ query: () => '/todos', providesTags: (result = []) => [{ type: 'Todo', id: 'LIST' }, ...result.map(({ id }) => ({ type: 'Todo', id }))] }),
    addTodo: builder.mutation({ query: (body) => ({ url: '/todos', method: 'POST', body }), invalidatesTags: [{ type: 'Todo', id: 'LIST' }] }),
    updateTodo: builder.mutation({ query: ({ id, ...body }) => ({ url: `/todos/${id}`, method: 'PATCH', body }), invalidatesTags: (_result, _error, { id }) => [{ type: 'Todo', id }, { type: 'Todo', id: 'LIST' }] }),
    deleteTodo: builder.mutation({ query: (id) => ({ url: `/todos/${id}`, method: 'DELETE' }), invalidatesTags: (_result, _error, id) => [{ type: 'Todo', id }, { type: 'Todo', id: 'LIST' }] }),
  }),
})

export const { useGetTodosQuery, useAddTodoMutation, useUpdateTodoMutation, useDeleteTodoMutation } = todosApi
