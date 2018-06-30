# MongoDBで構築する受注システムの簡易GraphQL API

node.jsとexpressで構築

## 機能：

受注、商品、顧客の作成と参照

受注は複数の商品と一人の顧客で構成

商品の変更を監視（subscription）

## インストール、ビルド、起動:

```
npm install
npm start
```

## 使い方：

```graphql
mutation createProduct {
  createProduct(title:"テスト", category:"camera"){
    _id
    category
    title
  }
}

mutation updateProduct {
  updateProduct(_id:"5b349de8ab54920d2dde55ad",
                title:"iPhone",
                category:"phone") {
    _id
    title
    category
  }
}

query searchProducts {
  products {
    _id
    title
    category
  }
}

query searchProduct {
  product(_id:"5b349de8ab54920d2dde55ad") {
    _id
    title
    category
  }
}

mutation createCustomer {
  createCustomer(name:"山田太郎", tel:"0901234567", pref:"東京都"){
    _id
    name
    tel
    pref
  }
}

query searchCustomers {
  customers {
    _id
    name
    tel
    pref
  }
}

query searchCustomer {
  customer(_id:"5b34a422452dd05397126fc6") {
    _id
    name
    tel
    pref
  }
}

mutation createOrder {
  createOrder(price: 100, 
              products:["5b349de8ab54920d2dde55ad", 
                        "5b349e03ab54920d2dde55ae"],
              customer:"5b34a422452dd05397126fc6"){
    _id
    price
    products {
      _id
      title
      category
    }
    customer {
      _id
      name
      tel
      pref
    }
  }
}

query searchOrders {
  orders {
    _id
    price
    products {
      _id
      title
      category
    }
    customer {
      _id
      name
      tel
      pref
    }
  }
}

query searchOrder {
  order(_id:"5b34a54cf5c32c590b63da89") {
    _id
    price
    products {
      _id
      title
      category
    }
    customer {
      _id
      name
      tel
      pref
    }
  }
}
```

## subscriptionの使い方

```graphql
subscription {
  productInfoChanged {
    _id
    title
    category
  }
}

```