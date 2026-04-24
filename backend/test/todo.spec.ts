import { afterAll, afterEach, beforeAll, describe, expect, test, vi } from 'vitest'
import { serverOf } from '../src/server'
import * as TodoRepo from '../src/repo/todo'
import { FastifyInstance } from 'fastify'
import { Todo, TodoBody } from '../src/types/todo'

describe('Todo API Testing', () => {
  let server: FastifyInstance

  beforeAll(async () => {
    server = serverOf()
    await server.ready()
  })

  afterAll(async () => {
    await server.close()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  test('When receive a GET /api/v1/todos request, Then it should response an array of todos', async () => {
    // arrange: mock the repo function to return an array of todos
    const todos: Array<Todo> = [
      {
        id: '1',
        name: 'todo 1',
        description: 'description 1',
        status: false
      },
      {
        id: '2',
        name: 'todo 2',
        description: 'description 2',
        status: true
      }
    ]
    // Mock findAllTodos get all todos from database
    vi.spyOn(TodoRepo, 'findAllTodos').mockImplementation(async () => todos)

    // act: receive a GET /api/v1/todos request
    const response = await server.inject({
      method: 'GET',
      url: '/api/v1/todos'
    })

    // assert: response should be an array of todos
    const result = JSON.parse(response.body)['todos']
    expect(result).toStrictEqual(todos)
  })

  test('Given an empty array return from repo function, When receive a GET /api/v1/todos request, Then it should response an empty array', async () => {
    // arrange: mock the repo function to return an empty array
    vi.spyOn(TodoRepo, 'findAllTodos').mockImplementation(async () => [])

    // act: receive a GET /api/v1/todos request
    const response = await server.inject({
      method: 'GET',
      url: '/api/v1/todos'
    })

    // assert: response should be an empty array
    const todos = JSON.parse(response.body)['todos']
    expect(todos).toStrictEqual([])
  })

  test('Given a valid ID and status, When receive a PUT /api/v1/todos/:id request, Then it should response the updated todo object', async () => {
    // arrange: mock the repo function to return an updated todo object
    const id = '1'
    const updatedTodo: Todo = {
      id: id,
      name: 'updated todo',
      description: 'updated description',
      status: true
    }
    // Mock updateTodo
    vi.spyOn(TodoRepo, 'updateTodoById').mockImplementation(async () => updatedTodo)

    // act: receive a PUT /api/v1/todos/:id request
    const response = await server.inject({
      method: 'PUT',
      url: `/api/v1/todos/${id}`,
      payload: {
        status: true
      }
    })

    // assert: response should be the updated todo object
    expect(response.statusCode).toBe(200)
    const result = JSON.parse(response.body)['todo']
    expect(result).toStrictEqual(updatedTodo)
  })

  test('Given an invalid ID, When receive a PUT /api/v1/todos/:id request, Then it should response with status code 404', async () => {
    // arrange: mock the repo function to return null
    vi.spyOn(TodoRepo, 'updateTodoById').mockImplementation(async () => null)

    // act: receive a PUT /api/v1/todos/:id request
    const response = await server.inject({
      method: 'PUT',
      url: '/api/v1/todos/non-existent-id',
      payload: {
        status: true
      }
    })

    // assert: response should with status code 404
    expect(response.statusCode).toBe(404)
  })

  // test('When receive a POST /api/v1/todos request, Then it should response with status code 201', async () => {
  //   // Arrange: Preparing fake documents and mock
  //   const newTodo = { id: '3', name: 'new todo', description: 'desc', status: false }

  //   vi.spyOn(TodoRepo, 'createTodo').mockResolvedValue(newTodo)

  //   // Act
  //   const response = await server.inject({
  //     method: 'POST',
  //     url: '/api/v1/todos',
  //     payload: { name: 'new todo', description: 'desc' }
  //   })

  //   // Assert
  //   expect(response.statusCode).toBe(201)
  //   const result = JSON.parse(response.body)['todo']
  //   expect(result.name).toBe('new todo')
  // })

  test('When POST /api/v1/todos fails, Then it should response with status code 500', async () => {
    // Arrange: addition failure
    vi.spyOn(TodoRepo, 'createTodo').mockRejectedValue(new Error('Internal Crash'))

    // Act
    const response = await server.inject({
      method: 'POST',
      url: '/api/v1/todos',
      payload: { name: 'fail todo' }
    })

    // Assert
    expect(response.statusCode).toBe(500)
  })
})
