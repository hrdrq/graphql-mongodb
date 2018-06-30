
import express from 'express'
import bodyParser from 'body-parser'
import { graphqlExpress, graphiqlExpress } from 'graphql-server-express'
import { execute, subscribe } from 'graphql'
import { createServer } from 'http'
import { SubscriptionServer } from 'subscriptions-transport-ws'
import cors from 'cors'

import { schema } from './src/schema'

const PORT = 3001
const GRAPHQL_PATH = '/graphql'
const GRAPHIQL_PATH = '/graphiql'
const SUBSRIPTIONS_ENDPOINT = `ws://localhost:${PORT}/subscriptions`

// Expressサーバ
const server = express()
server.use(cors())
server.use(GRAPHQL_PATH, bodyParser.json(), graphqlExpress({schema}))
server.use(GRAPHIQL_PATH, graphiqlExpress({
  endpointURL: GRAPHQL_PATH,
  subscriptionsEndpoint: SUBSRIPTIONS_ENDPOINT
}))

// Expressサーバをラップ
const ws = createServer(server)
ws.listen(PORT, () => {
  console.log(`http://localhost:${PORT}${GRAPHIQL_PATH} にアクセスしてください`);
  // GraphQL subscriptionsのため、ウェブソケットを設定
  new SubscriptionServer({
    execute,
    subscribe,
    schema
  }, {
    server: ws,
    path: '/subscriptions',
  })
})
