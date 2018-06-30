import { makeExecutableSchema } from 'graphql-tools'

import { resolvers } from './resolvers'

// GraphQLの操作定義
// order：    受注（単体）
// orders：   受注一覧
// product：  商品（単体）
// products： 商品一覧
// customer： 顧客（単体）
// customers：顧客一覧
// createOrder(価格, 商品IDリスト, 顧客ID)：  受注作成
// createProduct(タイトル, カテゴリ)：      　商品作成
// createCustomer(名前, 電話, 都道府県)：   　顧客作成
// updateProduct(商品id, タイトル, カテゴリ)：商品編集
const typeDefs = `
  type Query {
    order(_id: String): Order
    orders: [Order]
    product(_id: String): Product
    products: [Product]
    customer(_id: String): Customer
    customers: [Customer]
  }

  type Order {
    _id: String
    price: Int
    products: [Product]
    customer: Customer
  }

  type Product {
    _id: String
    title: String
    category: String
  }

  type Customer {
    _id: String
    name: String
    tel: String
    pref: String
  }

  type Mutation {
    createOrder(price: Int, products: [String], customer: String!): Order
    createProduct(title: String, category: String): Product
    createCustomer(name: String, tel: String, pref: String): Customer
    updateProduct(_id: String!, title: String, category: String): Product
  }

  # 商品の変化を監視
  type Subscription {
    productInfoChanged: Product
  }

  schema {
    query: Query
    mutation: Mutation
    subscription: Subscription
  }
`

const schema = makeExecutableSchema({ typeDefs, resolvers})
export { schema }
