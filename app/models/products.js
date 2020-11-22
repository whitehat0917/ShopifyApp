const basefunc = require('@libs/basefunc');

module.exports = {
  addProduct: function(product) {
    this.findById(product.product_service_id)
      .then((productData) => {
        if(productData) {
          return;
        }
        productData = {
          product_shopify_id: product.product_shopify_id,
          product_service_id: product.product_service_id,
          product_variants: product.product_variants,
          added_time: basefunc.getCurrentTimestamp()
        };
        var query = "INSERT INTO products SET ?";
        return new Promise(function(resolve, reject) {
          db.query(query, productData, function(err, result) {
            if(err)
              return reject(err);
            return resolve(result);
          });
        });
      });
  },
  updateProduct: function(product) {
    var query = "Update products set product_variants = ? WHERE product_shopify_id = ?";
    return new Promise(function(resolve, reject) {
      db.query(query, [product.product_variants, product.product_shopify_id], function(err, result) {
        if(err)
          return reject(err);
        if(result.length > 0)
          return resolve(result);
        else
          return resolve(null);
      });
    });
  },
  findById: function(product_service_id) {
    var query = "SELECT * FROM products WHERE product_service_id = ?";
    return new Promise(function(resolve, reject) {
      db.query(query, [product_service_id], function(err, result) {
        if(err)
          return reject(err);
        if(result.length > 0)
          return resolve(result[0]);
        else
          return resolve(null);
      });
    });
  },
  findByShopifyId: function(product_service_id) {
    var query = "SELECT * FROM products WHERE product_shopify_id = ?";
    return new Promise(function(resolve, reject) {
      db.query(query, [product_service_id], function(err, result) {
        if(err)
          return reject(err);
        if(result.length > 0)
          return resolve(result[0]);
        else
          return resolve(null);
      });
    });
  },
  findByIds: function(data) {
    var query = "SELECT * FROM products WHERE";
    for (let i=0;i<data.length;i++){
      query += ' (product_shopify_id like "%'+data[i].id+'" or product_variants like "%'+data[i].id+'%") or';
    }
    query = query.slice(0, -2);
    return new Promise(function(resolve, reject) {
      db.query(query, function(err, result) {
        if(err)
          return reject(err);
        if(result.length > 0)
          return resolve(result);
        else
          return resolve(null);
      });
    });
  }
};