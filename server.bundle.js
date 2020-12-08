!function(e){var t={};function n(o){if(t[o])return t[o].exports;var r=t[o]={i:o,l:!1,exports:{}};return e[o].call(r.exports,r,r.exports,n),r.l=!0,r.exports}n.m=e,n.c=t,n.d=function(e,t,o){n.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:o})},n.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},n.t=function(e,t){if(1&t&&(e=n(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var o=Object.create(null);if(n.r(o),Object.defineProperty(o,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var r in e)n.d(o,r,function(t){return e[t]}.bind(null,r));return o},n.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return n.d(t,"a",t),t},n.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},n.p="",n(n.s=9)}([function(e,t){e.exports={getCurrentTimestamp:function(){const e=new Date;return e.getFullYear()+"-"+("0"+(e.getMonth()+1)).slice(-2)+"-"+("0"+e.getDate()).slice(-2)+" "+("0"+e.getHours()).slice(-2)+":"+("0"+e.getMinutes()).slice(-2)+":"+("0"+e.getSeconds()).slice(-2)}}},function(e,t){e.exports=require("koa-router")},function(e,t,n){const o=n(0);e.exports={addServer:function(e){this.findByData(e).then(t=>{if(this.deleteActive(),!t){t={key_service:e.key_service,company_id:e.company_id,user_id:e.user_id,option:parseInt(e.option),active:1,added_time:o.getCurrentTimestamp()};return new Promise((function(e,n){db.query("INSERT INTO servers SET ?",t,(function(t,o){return t?n(t):e(o)}))}))}this.updateServer(e)})},findByData:function(e){return new Promise((function(t,n){db.query("SELECT * FROM servers WHERE key_service = ? and company_id = ? and user_id = ?",[e.key_service,e.company_id,e.user_id],(function(e,o){return e?n(e):o.length>0?t(o[0]):t(null)}))}))},updateServer:function(e){return new Promise((function(t,n){db.query("UPDATE servers SET active = 1, option = ? WHERE key_service = ? and company_id = ? and user_id = ?",[parseInt(e.option),e.key_service,e.company_id,e.user_id],(function(e,o){return e?n(e):t(o)}))}))},deleteActive:function(){return new Promise((function(e,t){db.query("UPDATE servers set active = 0;",(function(n,o){return n?t(n):e(o)}))}))},getActiveServer:function(e){return new Promise((function(e,t){db.query("SELECT * FROM servers WHERE active = 1",(function(n,o){return n?t(n):o.length>0?e(o[0]):e(null)}))}))}}},function(e,t){e.exports=require("dotenv")},function(e,t){e.exports=require("@shopify/koa-shopify-auth")},function(e,t){e.exports=require("@shopify/koa-shopify-graphql-proxy")},function(e,t,n){const o=n(22);n(23);n(3).config();const r=n(2),i=n(7),s=n(8),c=n(24),a=n(25),d="https://sistema.smuebleria.com/ServicePaginas/SMuebleriaPaginas.svc";async function u(e){return await o.get(d+"/ObtenerDatosProductos2?claveServicio="+e.key_service+"&idEmpresa="+e.company_id+"&idUsuario="+e.user_id)}function l(e,t){let n="mutation {productCreate(input: {";return n+=f(e),n+="}){ userErrors {   field   message  }  product {    id     variants(first: 100) {    edges {      node {        id      }    }  }  }}}",n=JSON.stringify({query:n}),new Promise((function(o,r){fetch(`https://${t.shop_origin}/admin/api/2020-10/graphql.json`,{method:"POST",headers:{"Content-Type":"application/json","X-Shopify-Access-Token":t.access_token},body:n}).then(e=>e.json()).then(t=>{let n=t.data.productCreate.product.variants.edges,r="";for(let e=0;e<n.length;e++)r+=n[e].node.id;s.addProduct({product_service_id:e.IdProducto,product_shopify_id:t.data.productCreate.product.id,product_variants:r}),o()})}))}function p(e,t,n){let o='mutation {productUpdate(input: {id: "'+n+'",';return o+=f(e),o+="}){ userErrors {   field   message  }  product {    id     variants(first: 100) {    edges {      node {        id      }    }  }  }}}",console.log(o),o=JSON.stringify({query:o}),new Promise((function(e,n){fetch(`https://${t.shop_origin}/admin/api/2020-10/graphql.json`,{method:"POST",headers:{"Content-Type":"application/json","X-Shopify-Access-Token":t.access_token},body:o}).then(e=>e.json()).then(t=>{if(t.data.productUpdate.product.variants){let e=t.data.productUpdate.product.variants.edges,n="";for(let t=0;t<e.length;t++)n+=e[t].node.id;s.updateProduct({product_shopify_id:t.data.productUpdate.product.id,product_variants:n})}e()})}))}function f(e){let t="";if(e.Categoria&&(t+='productType: "'+e.Categoria+'",'),e.Nombre&&(t+='title: "'+e.Nombre+'",'),e.Descripcion&&(t+='descriptionHtml: "'+e.Descripcion+'",'),e.Descontinuado&&1==e.Descontinuado?t+="published: false,":t+="published: true,",e.RutaImagenes){t+="images: [";for(let n=0;n<e.RutaImagenes.length;n++)t+='{src: "'+e.RutaImagenes[n]+'"},';e.RutaImagenes.length>0&&(t=t.slice(0,-1)),t+="],"}if(e.Proveedor&&(t+='vendor: "'+e.Proveedor+'",'),e.DetalleProductos){t+='options: ["MATERIAL"],',t+="variants: [";for(let n=0;n<e.DetalleProductos.length;n++)t+="{",t+="taxable: false,",e.Existensia&&(t+="inventoryQuantities: [{availableQuantity: "+e.Existensia+', locationId: "'+process.env.LOCATION_ID+'"}],inventoryItem: {tracked: true},'),e.Precio&&(t+="price: "+e.Precio+","),e.PrecioLista&&e.PrecioLista>e.Precio&&(t+="compareAtPrice: "+e.PrecioLista+","),e.Peso&&(t+="weight: "+e.Peso+","),e.Clave&&(t+='sku: "'+e.Clave+'",'),e.DetalleProductos[n].Material&&(t+='options: ["'+e.DetalleProductos[n].Material+'"]'),t+="},";t=t.slice(0,-1),t+="]"}else t+="variants: [{",t+="taxable: false,",e.Existensia&&(t+="inventoryQuantities: [{availableQuantity: "+e.Existensia+', locationId: "'+process.env.LOCATION_ID+'"}],'),e.Precio&&(t+="price: "+e.Precio+","),e.PrecioLista&&e.PrecioLista>e.Precio&&(t+="compareAtPrice: "+e.PrecioLista+","),e.Peso&&(t+="weight: "+e.Peso+","),e.Clave&&(t+='sku: "'+e.Clave+'"'),t+="}]";return t}async function y(e,t){let n=d+"/InsertarCliente?claveServicio="+e.key_service+"&idEmpresa="+e.company_id+"&idUsuario="+e.user_id+"&nombre="+t.firstName+"&apellidos="+t.lastName+"&correo="+(null==t.email?"":t.email)+"&password=12345&telefono="+(null==t.phone?"":t.phone);n=encodeURI(n);let r=await o.get(n);return console.log(n),console.log(r.data),null!=t.email&&await c.addCustomer({email:t.email,service_id:r.data}),r.data}async function h(e,t,n){let r=d+"/InsertarDireccionCliente?claveServicio="+e.key_service+"&idEmpresa="+e.company_id+"&idUsuario="+e.user_id+"&idCliente="+n+"&idDireccion=0&calle="+t.address1+"&CP="+t.zip+"&telefono="+(null==t.phone?"empty":t.phone)+"&RFC=&razonSocial=&colonia="+t.address2+"&municipio="+t.country+"&ciudad="+t.city+"&estado="+t.province+"&referencias=";return r=encodeURI(r),(await o.get(r)).data}e.exports.schedule=async function(){r.getActiveServer().then(async e=>{let t=await u(e);t=t.data;let n=await i.findActiveShop();for(let e=0;e<t.length;e++){let o=await s.findById(t[e].IdProducto);null!=o?await p(t[e],n,o.product_shopify_id):await l(t[e],n)}})},e.exports.scheduleOrder=async function(){r.getActiveServer().then(async e=>{let t=await i.findActiveShop();await function(e,t){let n="{\n        shop {\n          currencyFormats {\n            moneyFormat\n          }\n        }\n        orders(first: 3, reverse: true)\t{\n          edges {\n            node {\n                legacyResourceId\n                displayFinancialStatus\n                createdAt\n                note\n                subtotalPriceSet{\n                  shopMoney{\n                    amount\n                  }\n                }\n                totalDiscountsSet{\n                  shopMoney{\n                    amount\n                  }\n                }\n                totalPriceSet{\n                  shopMoney{\n                    amount\n                  }\n                }\n                customer {\n                    legacyResourceId\n                    firstName\n                    lastName\n                    email\n                }\n                displayAddress{\n                    address1\n                }\n                shippingAddress {\n                    address1\n                    address2\n                    city\n                    province\n                    country\n                    phone\n                }\n                lineItems(first: 50) {\n                    edges {\n                      node {\n                        id\n                        quantity\n                        discountedTotalSet{\n                          shopMoney{\n                            amount\n                          }\n                        }\n                        product {\n                          id\n                        }\n                        variant {\n                            price\n                        }\n                      }\n                    }\n                }\n            }\n          }\n        }\n      }";return n=JSON.stringify({query:n}),new Promise((function(r,i){fetch(`https://${e.shop_origin}/admin/api/2020-10/graphql.json`,{method:"POST",headers:{"Content-Type":"application/json","X-Shopify-Access-Token":e.access_token},body:n}).then(e=>e.json()).then(async e=>{let n=e.data.orders.edges,i="";for(let e=0;e<n.length;e++){if(null==await a.findByShopifyId(n[e].node.legacyResourceId)){let r=[],u={};for(let t=0;t<n[e].node.lineItems.edges.length;t++){let o=0;o=null==n[e].node.lineItems.edges[t].node.variant?n[e].node.lineItems.edges[t].node.discountedTotalSet.shopMoney.amount:n[e].node.lineItems.edges[t].node.variant.price,u=await s.findByShopifyId(n[e].node.lineItems.edges[t].node.product.id),r.push({Cantidad:r.length+1,IdProducto:u.product_service_id,Precio:o,PrecioOriginal:o,Total:n[e].node.lineItems.edges[t].node.discountedTotalSet.shopMoney.amount})}let l=JSON.stringify(r),p=await c.findByEmail(n[e].node.customer.email),f="0",m="0";f=null==p?await y(t,n[e].node.customer):p.service_id,m=await h(t,n[e].node.shippingAddress,f),i=d+"/InsertarVentasShopify?claveServicio="+t.key_service+"&idEmpresa="+t.company_id+"&idUsuario="+t.user_id+"&idCliente="+f+"&fechaEntrega="+n[e].node.createdAt+"&direccion="+m+"&idTipodeOrden=1&direccionFacturacion="+m+"&subtotal="+n[e].node.subtotalPriceSet.shopMoney.amount+"&CostoEnvio=0&descuento="+n[e].node.totalDiscountsSet.shopMoney.amount+"&total="+n[e].node.totalPriceSet.shopMoney.amount+"&comentarios="+(null==n[e].note?"":n[e].note)+"&productos="+l,i=encodeURI(i),console.log(i);let g=await o.get(i).catch(e=>{console.log(e)});g=g.data,await a.addOrder({shopify_id:n[e].node.legacyResourceId,service_id:g[0].IdVenta}),i=d+"/InsertarPagosClientesPorVenta?claveServicio="+t.key_service+"&idEmpresa="+t.company_id+"&idUsuario="+t.user_id+"&idCliente="+f+"&IdVenta="+g[0].IdVenta+"&Monto="+n[e].node.totalPriceSet.shopMoney.amount+"&FormaPago=11805&Voucher=&NoCuenta=",i=encodeURI(i),console.log(i);await o.get(i).catch(e=>{console.log(e)})}}r()})}))}(t,e)})},e.exports.getProductList=u},function(e,t,n){const o=n(0);e.exports={addShop:function(e,t){this.findByName(e).then(n=>{if(this.deleteActive(),!n){n={shop_origin:e,access_token:t,active:1,added_time:o.getCurrentTimestamp()};return new Promise((function(e,t){db.query("INSERT INTO shops SET ?",n,(function(n,o){return n?t(n):e(o)}))}))}this.updateShop(e,t)})},findByName:function(e){return new Promise((function(t,n){db.query("SELECT * FROM shops WHERE shop_origin = ?",e,(function(e,o){return e?n(e):o.length>0?t(o[0]):t(null)}))}))},findActiveShop:function(e){return new Promise((function(t,n){db.query("SELECT * FROM shops WHERE active = 1",e,(function(e,o){return e?n(e):o.length>0?t(o[0]):t(null)}))}))},updateShop:function(e,t){return new Promise((function(n,o){db.query("UPDATE shops SET access_token = ?, active = 1 WHERE shop_origin = ?",[t,e],(function(e,t){return e?o(e):n(t)}))}))},deleteActive:function(){return new Promise((function(e,t){db.query("UPDATE shops set active = 0;",(function(n,o){return n?t(n):e(o)}))}))}}},function(e,t,n){const o=n(0);e.exports={addProduct:function(e){this.findById(e.product_service_id).then(t=>{if(!t){t={product_shopify_id:e.product_shopify_id,product_service_id:e.product_service_id,product_variants:e.product_variants,added_time:o.getCurrentTimestamp()};return new Promise((function(e,n){db.query("INSERT INTO products SET ?",t,(function(t,o){return t?n(t):e(o)}))}))}})},updateProduct:function(e){return new Promise((function(t,n){db.query("Update products set product_variants = ? WHERE product_shopify_id = ?",[e.product_variants,e.product_shopify_id],(function(e,o){return e?n(e):o.length>0?t(o):t(null)}))}))},findById:function(e){return new Promise((function(t,n){db.query("SELECT * FROM products WHERE product_service_id = ?",[e],(function(e,o){return e?n(e):o.length>0?t(o[0]):t(null)}))}))},findByShopifyId:function(e){return new Promise((function(t,n){db.query("SELECT * FROM products WHERE product_shopify_id = ?",[e],(function(e,o){return e?n(e):o.length>0?t(o[0]):t(null)}))}))},findByIds:function(e){var t="SELECT * FROM products WHERE";for(let n=0;n<e.length;n++)t+=' (product_shopify_id like "%'+e[n].id+'" or product_variants like "%'+e[n].id+'%") or';return t=t.slice(0,-2),new Promise((function(e,n){db.query(t,(function(t,o){return t?n(t):o.length>0?e(o):e(null)}))}))}}},function(e,t,n){n(10),n(3).config(),n(11);const o=n(12),r=n(13),i=n(14),{default:s}=n(4),{verifyRequest:c}=n(4),a=n(15),d=n(16),u=n(1),l=n(17),p=n(18),{default:f}=n(5),{ApiVersion:y}=n(5),{receiveWebhook:h,registerWebhook:m}=n(19),g=n(20),v=n(21),_=n(6);var S=i.createConnection({host:process.env.DB_HOST,user:process.env.DB_USER,password:process.env.DB_PASS,database:process.env.DB_NAME});S.connect((function(e){if(e)throw e;console.log("> Connected to mysql server")})),global.db=S;const P=parseInt(process.env.PORT,10)||3e3,E=r({dev:!1}),b=E.getRequestHandler(),{SHOPIFY_API_SECRET_KEY:T,SHOPIFY_API_KEY:w,HOST:I}=process.env;E.prepare().then(()=>{const e=new o;e.context.db=S,e.use(a({secure:!0,sameSite:"none"},e)),e.keys=[T],e.use(l("./")),e.use(s({apiKey:w,secret:T,scopes:["read_products","write_products","read_script_tags","write_script_tags","read_orders","read_customers"],accessMode:"offline",async afterAuth(e){const{shop:t,accessToken:o}=e.session;e.cookies.set("shopOrigin",t,{httpOnly:!1,secure:!0,sameSite:"none"});const r=await m({address:I+"/webhooks/products/create",topic:"PRODUCTS_CREATE",accessToken:o,shop:t,apiVersion:y.July20});r.success?console.log("> Webhook Registered!"):console.log("> Webhook registration failed!",r.result);const i=new v({shopName:t,accessToken:o});i.scriptTag.create({event:"onload",src:"https://cdnjs.cloudflare.com/ajax/libs/jquery/3.2.1/jquery.min.js"}).then(e=>{console.log("scriptTag created")},e=>{console.log("Error creating scriptTag. "+JSON.stringify(e.response.body))}),i.scriptTag.create({event:"onload",src:I+"/public/checkout.js"}).then(e=>{console.log("scriptTag created")},e=>{console.log("Error creating scriptTag. "+JSON.stringify(e.response.body))}),console.log("> Authenticated: "+t+" - "+o),n(7).addShop(t,o),e.redirect("https://"+t+"/admin/apps")}}));e.use(f({version:y.July20})),e.use(l("./public")),e.use(d({origin:"*"})),e.use(p());const t=new u,r=n(26),i=h({secret:T}),E=n(27)(i);t.all("/(.*)",c(),async e=>{await b(e.req,e.res),e.respond=!1,e.res.statusCode=200}),n(2).getActiveServer().then(async e=>{g.schedule("* * * * *",()=>{_.scheduleOrder()}),1==e.option?g.schedule("* * * * *",()=>{_.schedule()},{scheduled:!0,timezone:"America/Mexico_City"}):g.schedule("0 0 8 */2 * *",()=>{_.schedule()},{scheduled:!0,timezone:"America/Mexico_City"})}),e.use(r.routes()),e.use(r.allowedMethods()),e.use(E.routes()),e.use(E.allowedMethods()),e.use(t.routes()),e.use(t.allowedMethods()),e.listen(P,()=>{console.log("> Server started on port: "+P)})})},function(e,t){e.exports=require("isomorphic-fetch")},function(e,t){e.exports=require("module-alias/register")},function(e,t){e.exports=require("koa")},function(e,t){e.exports=require("next")},function(e,t){e.exports=require("mysql")},function(e,t){e.exports=require("koa-session")},function(e,t){e.exports=require("@koa/cors")},function(e,t){e.exports=require("koa-static")},function(e,t){e.exports=require("koa-body")},function(e,t){e.exports=require("@shopify/koa-shopify-webhooks")},function(e,t){e.exports=require("node-cron")},function(e,t){e.exports=require("shopify-api-node")},function(e,t){e.exports=require("axios")},function(e,t){e.exports=require("urlencode")},function(e,t,n){const o=n(0);e.exports={addCustomer:function(e){customerData={email:e.email,customer_service_id:e.service_id,added_time:o.getCurrentTimestamp()};return new Promise((function(e,t){db.query("INSERT INTO customers SET ?",customerData,(function(n,o){return n?t(n):e(o)}))}))},findByEmail:function(e){return new Promise((function(t,n){db.query("SELECT * FROM customers WHERE email = ?",[e],(function(e,o){return e?n(e):o.length>0?t(o[0]):t(null)}))}))}}},function(e,t,n){const o=n(0);e.exports={addOrder:function(e){orderData={shopify_id:e.shopify_id,service_id:e.service_id,added_time:o.getCurrentTimestamp()};return new Promise((function(e,t){db.query("INSERT INTO orders SET ?",orderData,(function(n,o){return n?t(n):e(o)}))}))},findByShopifyId:function(e){return new Promise((function(t,n){db.query("SELECT * FROM orders WHERE shopify_id = ?",[e],(function(e,o){return e?n(e):o.length>0?t(o[0]):t(null)}))}))}}},function(e,t,n){const o=n(1),r=n(2),i=n(8),s=new o({prefix:"/api"}),c=n(6);s.get("/",async e=>{e.body="Api request"}),s.post("/saveData",async e=>{let t=e.request.body;r.addServer(t),e.body="Api request"}),s.post("/checkStock",async e=>{let t=e.request.body.data;t=JSON.parse(t);let n=!0,o=r.getActiveServer();await o.then(async e=>{let o=await c.getProductList(e);o=o.data;let r=await i.findByIds(t);for(let e=0;e<r.length;e++)for(let i=0;i<o.length;i++)if(o[i].IdProducto==r[e].product_service_id){for(let s=0;s<t.length;s++)if(r[e].product_shopify_id.indexOf(t[s].id.toString())>=0||r[e].product_variants.indexOf(t[s].id.toString())>=0){o[i].Existensia<parseInt(t[s].quantity)&&(n=!1);break}break}}),e.body=n}),e.exports=s},function(e,t,n){const o=new(n(1))({prefix:"/webhook"});e.exports=function(e){return o.post("/product/create",e,async e=>{console.log("> New product created!")}),o}}]);