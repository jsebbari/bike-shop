var express = require('express');
var router = express.Router();


//Stripe
const Stripe = require('stripe');
const stripe = Stripe('sk_test_51KHmotBttUo9PrV6HESEXfPHXR2P91Jdem3gd7rYtJL6Tz5gGNKtSQ2ZNYdPvclInBE9uWDUus1odIKGjJD4sMY900gXGjD51g');

var dataBike = [
  {name:"BIK045", url:"/images/bike-1.jpg", price:679,mea:true},
  {name:"ZOOK07", url:"/images/bike-2.jpg", price:999,mea:false},
  {name:"TITANS", url:"/images/bike-3.jpg", price:799,mea:true},
  {name:"CEWO", url:"/images/bike-4.jpg", price:1300,mea:false},
  {name:"AMIG039", url:"/images/bike-5.jpg", price:479,mea:true},
  {name:"LIK099", url:"/images/bike-6.jpg", price:869,mea:false},
]


/* GET home page. */
router.get('/', function(req, res, next) {

  console.log(dataBike)

  if(req.session.dataCardBike == undefined){
    req.session.dataCardBike = []
  }

  res.render('index', {dataBike:dataBike});
});






router.get('/shop', function(req, res, next) {

  var alreadyExist = false;

  for(var i = 0; i< req.session.dataCardBike.length; i++){
    if(req.session.dataCardBike[i].name == req.query.bikeNameFromFront){
      req.session.dataCardBike[i].quantity = Number(req.session.dataCardBike[i].quantity) + 1;
      alreadyExist = true;
    }
  }

  if(alreadyExist == false){
    req.session.dataCardBike.push({
      name: req.query.bikeNameFromFront,
      url: req.query.bikeImageFromFront,
      price: req.query.bikePriceFromFront,
      quantity: 1,
      shippingFees:30
    })
  }


  res.render('shop', {dataCardBike:req.session.dataCardBike});
});




router.get('/delete-shop', function(req, res, next){
  
  req.session.dataCardBike.splice(req.query.position,1)

  res.render('shop',{dataCardBike:req.session.dataCardBike})
})




router.post('/update-shop', function(req, res, next){
 
  var position = req.body.position;
  var newQuantity = req.body.quantity;

  req.session.dataCardBike[position].quantity = newQuantity;

  res.render('shop',{dataCardBike:req.session.dataCardBike})
})




router.post('/create-checkout-session', async (req, res) => {


  var line_items=[]

  req.session.dataCardBike.forEach(bike =>{ 
    line_items.push (
      { price_data: {
        currency: 'eur',
        product_data: {
          name: bike.name,
        },
        unit_amount:bike.price*100,
      },
      quantity: bike.quantity,
      }
    )
   })
 
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items,
    mode: 'payment',
    success_url: 'https://test-bikeshop.herokuapp.com/success',
    cancel_url: 'https://test-bikeshop.herokuapp.com/cancel',
  });
 
  res.redirect(303, session.url);
 });
 
 router.get('/success', (req, res) => { //ou '/cancel'
  res.render('success'); //ou 'cancel'
 });

 router.get('/cancel', (req, res) => { //ou '/cancel'
  res.render('cancel'); //ou 'cancel'
 });

module.exports = router;
