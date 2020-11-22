const Router = require('koa-router')
const serverModel = require('@models/servers');
const productModel = require('@models/products');
const router = new Router({ prefix: '/api' })
const communicate = require('../communicate/index.js');

router.get('/', async (ctx) => {
  ctx.body = 'Api request';
});

router.post('/saveData', async (ctx) => {
  let data = ctx.request.body;
  serverModel.addServer(data);
  ctx.body = 'Api request';
});

router.post('/checkStock', async (ctx) => {
  let data = ctx.request.body.data;
  data = JSON.parse(data);
  let check = true;
  let promise = serverModel.getActiveServer();
  await promise.then(async (serverData) => {
    let productList = await communicate.getProductList(serverData);
    productList = productList.data;
    let shopData = await productModel.findByIds(data);
    for (let i=0;i<shopData.length;i++){
      for (let j=0;j<productList.length;j++){
        if (productList[j].IdProducto == shopData[i].product_service_id){
          for (let k=0;k<data.length;k++){
            if (shopData[i].product_shopify_id.indexOf(data[k].id.toString()) >= 0 || shopData[i].product_variants.indexOf(data[k].id.toString()) >= 0){
              if (productList[j].Existensia < parseInt(data[k].quantity)){
                check = false;
              }
              break;
            }
          }
          break;
        }
      }
    }
  })
  ctx.body = check;
});

module.exports = router