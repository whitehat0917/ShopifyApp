const basefunc = require('@libs/basefunc');

module.exports = {
  addOrder: function(order) {
    orderData = {
      shopify_id: order.shopify_id,
      service_id: order.service_id,
      added_time: basefunc.getCurrentTimestamp()
    };
    var query = "INSERT INTO orders SET ?";
    return new Promise(function(resolve, reject) {
      db.query(query, orderData, function(err, result) {
        if(err)
          return reject(err);
        return resolve(result);
      });
    });
  },
  findByShopifyId: function(shopify_id) {
    var query = "SELECT * FROM orders WHERE shopify_id = ?";
    return new Promise(function(resolve, reject) {
      db.query(query, [shopify_id], function(err, result) {
        if(err)
          return reject(err);
        if(result.length > 0)
          return resolve(result[0]);
        else
          return resolve(null);
      });
    });
  },
};