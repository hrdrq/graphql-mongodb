import { MongoClient, ObjectId } from 'mongodb'

// 使うデータベースに変更してください
const MONGO_URL = 'mongodb://localhost:27017/orderSystem'

// オブジェクトObjectIDを文字列に変換
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

// MongoDBのコレクション変数
var Orders, Products, Customers

// MongoDBに接続
(async function connect () {
  const db = await MongoClient.connect(MONGO_URL)
  Orders = db.collection('orders')
  Products = db.collection('products')
  Customers = db.collection('customers')
})()

export const mh = {
  createOrder: async args => {
    const res = await Orders.insert(args)
    return idToStr(await Orders.findOne({_id: res.insertedIds[0]}))
  },
  getOrder: async (_id) => {
    return idToStr(await Orders.findOne(ObjectId(_id)))
  },
  getOrders: async () => {
    return (await Orders.find({}).toArray()).map(idToStr)
  },
  createProduct: async args => {
    const res = await Products.insert(args)
    console.log('res', res)
    return idToStr(await Products.findOne({_id: res.insertedIds[0]}))
  },
  updateProduct: async args => {
    const _id = args._id
    delete args._id
    await Products.update({_id: ObjectId(_id)}, args)
    return idToStr(await Products.findOne({_id: ObjectId(_id)}))
  },
  getProduct: async (_id) => {
    return idToStr(await Products.findOne(ObjectId(_id)))
  },
  getProducts: async () => {
    return (await Products.find({}).toArray()).map(idToStr)
  },
  getProductsWithIdArray: async idArray => {
    return (await Products.find({_id: {'$in': strListToIdList(idArray)}}).toArray()).map(idToStr)
  },
  createCustomer: async args => {
    const res = await Customers.insert(args)
    return idToStr(await Customers.findOne({_id: res.insertedIds[0]}))
  },
  getCustomer: async (_id) => {
    return idToStr(await Customers.findOne(ObjectId(_id)))
  },
  getCustomers: async () => {
    return (await Customers.find({}).toArray()).map(idToStr)
  }
}