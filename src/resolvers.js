import { PubSub } from 'graphql-subscriptions'

import { mh } from './mongodbHandler'

const pubsub = new PubSub()
export const resolvers = {
  // データの取得
  Query: {
    order: async (root, {_id}) => {
      return await mh.getOrder(_id)
    },
    orders: async () => {
      return await mh.getOrders()
    },
    product: async (root, {_id}) => {
      console.log('mh', mh)
      return await mh.getProduct(_id)
    },
    products: async () => {
      return await mh.getProducts()
    },
    customer: async (root, {_id}) => {
      return await mh.getCustomer(_id)
    },
    customers: async () => {
      return await mh.getCustomers()
    }
  },
  // 受注、商品と顧客の関連
  Order: {
    // 商品IDリストを商品objectリストに変換
    // 引数のproductsは実際にordersコレクションに入っている文字列のリスト
    products: async ({_id, products}) => {
      return await mh.getProductsWithIdArray(products)
    },
    // 顧客IDを顧客objectに変換
    // 引数のcustomerは実際にordersコレクションに入っている文字列
    customer: async ({_id, customer}) => {
      return await mh.getCustomer(customer)
    }
  },
  // 作成、編集関数
  Mutation: {
    createOrder: async (root, args, context, info) => {
      return await mh.createOrder(args)
    },
    createProduct: async (root, args) => {
      return await mh.createProduct(args)
    },
    createCustomer: async (root, args) => {
      return await mh.createCustomer(args)
    },
    updateProduct: async (root, args) => {
      const product = await mh.updateProduct(args)
      // pubsub.publish(topic, data)
      // topicの名前とsubscriptionの名前は一致しなくてもいい
      pubsub.publish('productInfoChanged', { productInfoChanged: product })
      return product
    }
  },
  // データの監視（ウェブソケットを利用）
  Subscription: {
    productInfoChanged: {
      // オブジェクトを返さない
      // 代わりにAsyncIteratorを返す。AsyncIteratorがメッセージをクライアントに送信
      subscribe: () => pubsub.asyncIterator('productInfoChanged')
    }
  }
}