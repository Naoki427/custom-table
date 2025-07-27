import { describe, it, expect } from 'vitest'
import { request, gql } from 'graphql-request'

const endpoint = 'http://localhost:4000/graphql'

describe('GraphQLサーバー + MongoDB の起動確認', () => {
  it('GraphQLがクエリに応答する', async () => {
    const query = gql`
      {
        __typename
      }
    `
    const data: { __typename: string } = await request(endpoint, query)
    expect(data.__typename).toBe('Query')
  })
})
