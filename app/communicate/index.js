const axios = require('axios');
const urlencode = require('urlencode');

require('dotenv').config();
const serverModel = require('@models/servers');
const shopModel = require('@models/shops');
const productModel = require('@models/products');
const customerModel = require('@models/customers');
const orderModel = require('@models/orders');

const api_url = "https://sistema.smuebleria.com/ServicePaginas/SMuebleriaPaginas.svc";

async function schedule() {
    let promise = serverModel.getActiveServer();
    promise.then(async (serverData) => {
        let productList = await getProductList(serverData);
        productList = productList.data;
        let shopData = await shopModel.findActiveShop();
        for (let i = 0; i < productList.length; i++) {
            let result = await productModel.findById(productList[i].IdProducto);
            if (result != null) {
                await updateProduct(productList[i], shopData, result.product_shopify_id);
            } else {
                await createProduct(productList[i], shopData);
            }
        }
    })
    return;
}

async function scheduleOrder() {
    let promise = serverModel.getActiveServer();
    promise.then(async (serverData) => {
        let shopData = await shopModel.findActiveShop();
        await transferOrders(shopData, serverData);
    })
    return;
}

async function getProductList(server) {
    return await axios.get(api_url + '/ObtenerDatosProductos2?claveServicio=' + server.key_service + '&idEmpresa=' + server.company_id + '&idUsuario=' + server.user_id);
}

function createProduct(product, shop) {
    let query = "mutation {" +
        "productCreate(input: {";
    query += createProductQuery(product);
    query += "})" +
        "{" +
        " userErrors {" +
        "   field" +
        "   message" +
        "  }" +
        "  product {" +
        "    id " +
        "    variants(first: 100) {" +
        "    edges {" +
        "      node {" +
        "        id" +
        "      }" +
        "    }"+
        "  }" +
        "  }" +
        "}" +
        "}";
    query = JSON.stringify({
        query: query
    });
    return new Promise(function (resolve, reject) {
        fetch(`https://${shop.shop_origin}/admin/api/2020-10/graphql.json`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Shopify-Access-Token': shop.access_token
            },
            body: query
        })
            .then(response => response.json())
            .then(responseJson => {
                let variants = responseJson.data.productCreate.product.variants.edges;
                let product_variants = "";
                for (let i=0;i<variants.length;i++){
                    product_variants += variants[i].node.id;
                }
                productModel.addProduct({ product_service_id: product.IdProducto, product_shopify_id: responseJson.data.productCreate.product.id, product_variants: product_variants });
                resolve();
            });
    });
}

function updateProduct(product, shop, id) {
    let query = 'mutation {' +
        'productUpdate(input: {id: "' + id + '",';
    query += createProductQuery(product);
    query += "})" +
        "{" +
        " userErrors {" +
        "   field" +
        "   message" +
        "  }" +
        "  product {" +
        "    id " +
        "    variants(first: 100) {" +
        "    edges {" +
        "      node {" +
        "        id" +
        "      }" +
        "    }"+
        "  }" +
        "  }" +
        "}" +
        "}";
        console.log(query)
    query = JSON.stringify({
        query: query
    });
    return new Promise(function (resolve, reject) {
        fetch(`https://${shop.shop_origin}/admin/api/2020-10/graphql.json`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Shopify-Access-Token': shop.access_token
            },
            body: query
        })
            .then(response => response.json())
            .then(responseJson => {
                if (responseJson.data.productUpdate.product.variants){
                    let variants = responseJson.data.productUpdate.product.variants.edges;
                    let product_variants = "";
                    for (let i=0;i<variants.length;i++){
                        product_variants += variants[i].node.id;
                    }
                    productModel.updateProduct({ product_shopify_id: responseJson.data.productUpdate.product.id, product_variants: product_variants });
                }
                resolve();
            });
    });
}

function createProductQuery(data) {
    let query = '';
    if (data.Categoria) {
        query += 'productType: "' + data.Categoria + '",';
    }
    if (data.Nombre) {
        query += 'title: "' + data.Nombre + '",';
    }
    if (data.Descripcion) {
        query += 'descriptionHtml: "' + data.Descripcion + '",';
    }
    if (data.Descontinuado && data.Descontinuado == true) {
        query += 'published: false,';
    }else{
        query += 'published: true,';
    }
    if (data.RutaImagenes) {
        query += 'images: [';
        for (let i = 0; i < data.RutaImagenes.length; i++) {
            query += '{src: "' + data.RutaImagenes[i] + '"},';
        }
        if (data.RutaImagenes.length > 0)
            query = query.slice(0, -1);
        query += '],';
    }
    if (data.Proveedor) {
        query += 'vendor: "' + data.Proveedor + '",';
    }
    if (data.DetalleProductos){
        query += 'options: ["MATERIAL"],';
        query += 'variants: [';
        for (let i = 0;i<data.DetalleProductos.length;i++){
            query += '{';
            query += 'taxable: false,';
            if (data.Existensia) {
                query += 'inventoryQuantities: [{availableQuantity: ' + data.Existensia + ', locationId: "'+process.env.LOCATION_ID+'"}],inventoryItem: {tracked: true},';
            }
            if (data.Precio) {
                query += 'price: ' + data.Precio + ',';
            }
            if (data.PrecioLista && data.PrecioLista > data.Precio) {
                query += 'compareAtPrice: ' + data.PrecioLista + ',';
            }
            if (data.Peso) {
                query += 'weight: ' + data.Peso + ',';
            }
            if (data.Clave) {
                query += 'sku: "' + data.Clave + '",';
            }
            if (data.DetalleProductos[i].Material){
                query += 'options: ["'+data.DetalleProductos[i].Material+'"]';
            }
            query += '},';
        }
        query = query.slice(0, -1);
        query += ']';
    }else{
        query += 'variants: [{';
        query += 'taxable: false,';
        if (data.Existensia) {
            query += 'inventoryQuantities: [{availableQuantity: ' + data.Existensia + ', locationId: "'+process.env.LOCATION_ID+'"}],';
        }
        if (data.Precio) {
            query += 'price: ' + data.Precio + ',';
        }
        if (data.PrecioLista && data.PrecioLista > data.Precio) {
            query += 'compareAtPrice: ' + data.PrecioLista + ',';
        }
        if (data.Peso) {
            query += 'weight: ' + data.Peso + ',';
        }
        if (data.Clave) {
            query += 'sku: "' + data.Clave + '"';
        }
        query += '}]';
    }
    return query;
}

function transferOrders(shop, server) {
    let query = `{
        shop {
          currencyFormats {
            moneyFormat
          }
        }
        orders(first: 3, reverse: true)	{
          edges {
            node {
                legacyResourceId
                displayFinancialStatus
                createdAt
                note
                subtotalPriceSet{
                  shopMoney{
                    amount
                  }
                }
                totalDiscountsSet{
                  shopMoney{
                    amount
                  }
                }
                totalPriceSet{
                  shopMoney{
                    amount
                  }
                }
                customer {
                    legacyResourceId
                    firstName
                    lastName
                    email
                }
                displayAddress{
                    address1
                }
                shippingAddress {
                    address1
                    address2
                    city
                    province
                    country
                    phone
                }
                lineItems(first: 50) {
                    edges {
                      node {
                        id
                        quantity
                        discountedTotalSet{
                          shopMoney{
                            amount
                          }
                        }
                        product {
                          id
                        }
                        variant {
                            price
                        }
                      }
                    }
                }
            }
          }
        }
      }`;
    query = JSON.stringify({
        query: query
    });
    return new Promise(function (resolve, reject) {
        fetch(`https://${shop.shop_origin}/admin/api/2020-10/graphql.json`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Shopify-Access-Token': shop.access_token
            },
            body: query
        })
        .then(response => response.json())
        .then(async responseJson => {
            let data = responseJson.data.orders.edges;
            let url = "";
            for (let i=0;i<data.length;i++){
                let order = await orderModel.findByShopifyId(data[i].node.legacyResourceId);
                if (order == null){
                    let productArray = [];
                    let product = {};
                    for (let j=0;j<data[i].node.lineItems.edges.length;j++){
                        let tempPrice = 0;
                        if (data[i].node.lineItems.edges[j].node.variant == null){
                            tempPrice = data[i].node.lineItems.edges[j].node.discountedTotalSet.shopMoney.amount;
                        }else{
                            tempPrice = data[i].node.lineItems.edges[j].node.variant.price;
                        }
                        product = await productModel.findByShopifyId(data[i].node.lineItems.edges[j].node.product.id);
                        productArray.push({Cantidad: productArray.length+1, IdProducto: product.product_service_id, Precio: tempPrice, PrecioOriginal: tempPrice, Total: data[i].node.lineItems.edges[j].node.discountedTotalSet.shopMoney.amount});
                    }
                    let productString = JSON.stringify(productArray);
                    let customer = await customerModel.findByEmail(data[i].node.customer.email);
                    let customerId = "0";
                    let addressId = '0';
                    if (customer == null){
                        customerId = await createCustomer(server, data[i].node.customer);
                    }else{
                        customerId = customer.service_id;
                    }
                    addressId = await createAddress(server, data[i].node.shippingAddress, customerId);
                    url = api_url + '/InsertarVentasShopify?claveServicio=' + server.key_service + '&idEmpresa=' + server.company_id + '&idUsuario=' + server.user_id + '&idCliente=' + customerId + '&fechaEntrega=' + data[i].node.createdAt + '&direccion=' + addressId + '&idTipodeOrden=1&direccionFacturacion=' + addressId +'&subtotal=' + data[i].node.subtotalPriceSet.shopMoney.amount + '&CostoEnvio=0&descuento=' + data[i].node.totalDiscountsSet.shopMoney.amount + '&total=' + data[i].node.totalPriceSet.shopMoney.amount + '&comentarios=' + (data[i].note==null?"":data[i].note) + '&productos='+productString;
                    url = encodeURI(url);
                    console.log(url)
                    let orderId = await axios.get(url).catch(error=>{
                        console.log(error)
                    });
                    orderId = orderId.data;
                    await orderModel.addOrder({shopify_id: data[i].node.legacyResourceId, service_id: orderId[0].IdVenta});

                    url = api_url + '/InsertarPagosClientesPorVenta?claveServicio=' + server.key_service + '&idEmpresa=' + server.company_id + '&idUsuario=' + server.user_id + '&idCliente=' + customerId + '&IdVenta=' + orderId[0].IdVenta + '&Monto=' + data[i].node.totalPriceSet.shopMoney.amount + '&FormaPago=11805&Voucher=&NoCuenta=';
                    url = encodeURI(url);
                    console.log(url)
                    let paymentUrl = await axios.get(url).catch(error=>{
                        console.log(error)
                    });
                }
            }
            resolve();
        });
    });
}

async function createCustomer(server, customer){
    let url = api_url + "/InsertarCliente?claveServicio="+server.key_service+"&idEmpresa="+server.company_id+"&idUsuario="+server.user_id+"&nombre="+customer.firstName+"&apellidos="+customer.lastName+"&correo="+(customer.email==null?"":customer.email)+"&password=12345&telefono="+(customer.phone==null?"":customer.phone);
    url = encodeURI(url);
    let result = await axios.get(url);
    console.log(url)
    console.log(result.data)
    if (customer.email != null){
        await customerModel.addCustomer({email: customer.email, service_id: result.data});
    }
    return result.data;
}

async function createAddress(server, address, customerId){
    let url = api_url + "/InsertarDireccionCliente?claveServicio="+server.key_service+"&idEmpresa="+server.company_id+"&idUsuario="+server.user_id+"&idCliente="+customerId+"&idDireccion=0&calle="+address.address1+"&CP="+address.zip+"&telefono="+(address.phone==null?"empty":address.phone)+"&RFC=&razonSocial=&colonia="+address.address2+"&municipio="+address.country+"&ciudad="+address.city+"&estado="+address.province+"&referencias=";
    url = encodeURI(url);
    let result = await axios.get(url);
    return result.data;
}

module.exports.schedule = schedule;
module.exports.scheduleOrder = scheduleOrder;
module.exports.getProductList = getProductList;