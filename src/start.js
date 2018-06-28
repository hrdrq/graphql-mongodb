import {MongoClient, ObjectId} from 'mongodb'
import express from 'express'
import bodyParser from 'body-parser'
import {graphqlExpress, graphiqlExpress} from 'graphql-server-express'
import {makeExecutableSchema} from 'graphql-tools'
import cors from 'cors'

const GRAPHQL_PATH = '/graphql'
const GRAPHIQL_PATH = '/graphiql'
const PORT = 3001
// 使うデータベースに変更してください
const MONGO_URL = 'mongodb://localhost:27017/orderSystem'

// ObjectIDを文字列に変換
const idToStr = (o) => {
  o._id = o._id.toString()
  return o
}

// ID文字列のリストをObjectIDのリストに変換
const strListToIdList = strList => {
  return strList.map(str => {
    return ObjectId(str)
  })
}

export const start = async () => {
  try {
    const db = await MongoClient.connect(MONGO_URL)

    // MongoDBのコレクション変数
    const Orders = db.collection('orders')
    const Products = db.collection('products')
    const Customers = db.collection('customers')

    // GraphQLの操作定義
    // order：    受注（単体）
    // orders：   受注一覧
    // product：  商品（単体）
    // products： 商品一覧
    // customer： 顧客（単体）
    // customers：顧客一覧
    // createOrder(価格, 商品IDリスト, 顧客ID)：受注作成
    // createProduct(タイトル, カテゴリ)：      商品作成
    // createCustomer(名前, 電話, 都道府県)：   顧客作成
    const typeDefs = [`
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
        createOrder(price: Int, products: [String], customer: String): Order
        createProduct(title: String, category: String): Product
        createCustomer(name: String, tel: String, pref: String): Customer
      }

      schema {
        query: Query
        mutation: Mutation
      }
    `]

    const resolvers = {
      // データの取得
      Query: {
        order: async (root, {_id}) => {
          return idToStr(await Orders.findOne(ObjectId(_id)))
        },
        orders: async () => {
          return (await Orders.find({}).toArray()).map(idToStr)
        },
        product: async (root, {_id}) => {
          return idToStr(await Products.findOne(ObjectId(_id)))
        },
        products: async () => {
          return (await Products.find({}).toArray()).map(idToStr)
        },
        customer: async (root, {_id}) => {
          return idToStr(await Customers.findOne(ObjectId(_id)))
        },
        customers: async () => {
          return (await Customers.find({}).toArray()).map(idToStr)
        }
      },
      // 受注、商品と顧客の関連
      Order: {
        // 商品IDリストを商品objectリストに変換
        // 引数のproductsは実際にordersコレクションに入っている文字列のリスト
        products: async ({_id, products}) => {
          return (await Products.find({_id: {'$in': strListToIdList(products)}}).toArray()).map(idToStr)
        },
        // 顧客IDを顧客objectに変換
        // 引数のcustomerは実際にordersコレクションに入っている文字列
        customer: async ({_id, customer}) => {
          return idToStr(await Customers.findOne(ObjectId(customer)))
        }
      },
      // 作成関数
      Mutation: {
        createOrder: async (root, args, context, info) => {
          const res = await Orders.insert(args)
          return idToStr(await Orders.findOne({_id: res.insertedIds[1]}))
        },
        createProduct: async (root, args) => {
          const res = await Products.insert(args)
          return idToStr(await Products.findOne({_id: res.insertedIds[1]}))
        },
        createCustomer: async (root, args) => {
          const res = await Customers.insert(args)
          return idToStr(await Customers.findOne({_id: res.insertedIds[1]}))
        }
      }
    }

    const schema = makeExecutableSchema({
      typeDefs,
      resolvers
    })

    const app = express()
    app.use(cors())
    app.use(GRAPHQL_PATH, bodyParser.json(), graphqlExpress({schema}))
    app.use(GRAPHIQL_PATH, graphiqlExpress({
      endpointURL: GRAPHQL_PATH
    }))
    app.listen(PORT, () => {
      console.log(`http://localhost:${PORT}${GRAPHIQL_PATH} にアクセスしてください`)
    })

  } catch (e) {
    console.log(e)
  }
}
