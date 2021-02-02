import { GraphQLClient } from 'graphql-request'
import { ErrorUnexpectedResult } from './errors'
const ENDPOINT = "https://api.thegraph.com/subgraphs/name/aragon/aragon-govern-rinkeby"

export class SubgraphClient {
  private client

  constructor() {
    this.client = new GraphQLClient(ENDPOINT, { headers: {} })
  }

  private async fetchResult<R>(
    queryAndParams:
      | [any]
      | [
        any,
        { [key: string]: any }
      ],
    errorMessage: string
  ): Promise<R> {
    const [query, params] = queryAndParams
    try {
      const result = await this.client.request(query, params)
      return result as R
    } catch (err) {
      throw new ErrorUnexpectedResult(errorMessage)
    }
  }

}
