$(document).ready(function(){
  $('body').on('change', '.cart__qty-input', function() {
    let data = [];
    let quantity = 0;
    let id = '';
    $("tr.cart__row").each(function(){
      id = $(this).attr("data-cart-item-url");
      id = id.split("=")[1];
      quantity = $(this).find(".cart__quantity-td").find(".cart__qty").find(".cart__qty-input").val();
      data.push({id: id, quantity: quantity});
    });
    $.post( "https://shopify.smuebleria.com/api/checkStock", { data: JSON.stringify(data) })
    .done(function( data ) {
      if (data == true){
        $(".additional-checkout-buttons").css("display", "block");
      }else{
        alert("Stock is not enough!");
        $(".additional-checkout-buttons").css("display", "none");
      }
    });
  });
  setTimeout(function(){
    if (meta.product){
      data = [{id: meta.product.id, quantity: "1"}];
      $.post( "https://shopify.smuebleria.com/api/checkStock", { data: JSON.stringify(data) })
      .done(function( data ) {
        if (data == false){
            alert("Stock is not enough!");
            $('.shopify-payment-button__button').attr('disabled', true);
            $('.shopify-payment-button').css("display", "none");
        }
      });
    }
  }, 3000);
  $("form.cart").submit(function(e){
    e.preventDefault();
    let data = [];
    let quantity = 0;
    let id = '';
    $("tr.cart__row").each(function(){
      id = $(this).attr("data-cart-item-url");
      id = id.split("=")[1];
      quantity = $(this).find(".cart__quantity-td").find(".cart__qty").find(".cart__qty-input").val();
      data.push({id: id, quantity: quantity});
    });
    $.post( "https://shopify.smuebleria.com/api/checkStock", { data: JSON.stringify(data) })
    .done(function( data ) {
      if (data == true){
        $(this).unbind(e);
        $(".cart__submit").click();
      }else{
        alert("Stock is not enough!");
      }
    });
  });
});