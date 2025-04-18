const express = require('express')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
var cors = require('cors')
const app = express()
const port = process.env.PORT || 3000;

const corsConfig = {
  origin: '*',
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]
  }
  app.use(cors(corsConfig))
  app.use(express.json());
  
//update
// app.use(express.json());
// app.use(cors())
// app.use(express.json());
const stripe = require("stripe")('sk_test_51OFj8sLwl5tXPPRvyzjJzwHBOr1qZqgVfqMMfqgl6triaCIpXNUqaNBprDjwclvyneGcLd3Mh6SX8Uf6KMwvdGqy00Uja77TJR');
//const uri = `mongodb+srv://${process.env.db_user}:${process.env.db_pass}@cluster0.kf7gnio.mongodb.net/?retryWrites=true&w=majority`;
const uri = `mongodb+srv://${process.env.db_user}:${process.env.db_pass}@cluster0.kf7gnio.mongodb.net/?retryWrites=true&w=majority`;
console.log();
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
   // await client.connect();
    const database = client.db('HostelHub');
    const meal_collection = database.collection('meal');
    const upcomeing_meal_collection = database.collection('upComingMeal');
    const membership_package_collection=database.collection('membershipPackage');
    const userCollection=database.collection('user');
    const paymentCollection= database.collection("payments");
    const req_food_Collection= database.collection("foodRequest");
    const review_Collection= database.collection("reviews");
    const upcomingMeal_Like_Collection= database.collection("upcomingMealLikeStore");

    app.get('/membershipPackage',async(req,res)=>{
      const cursor= membership_package_collection.find();
      const result=await cursor.toArray();
      res.send(result);
    })

    app.get('/meal',async(req,res)=>{
      const cursor= meal_collection.find();
      const result=await cursor.toArray();
      res.send(result);
    })
    app.get('/requestFood',async(req,res)=>{
      const cursor= req_food_Collection.find();
      const result=await cursor.toArray();
      res.send(result);
    })

    app.delete('/requestedFoodDel/:id', async (req, res) => {
      const id=req.params.id;
      console.log('please delete from database',id);
      const query = { _id: new ObjectId(id) };
      const result = await req_food_Collection .deleteOne(query);
      res.send(result);
      if (result.deletedCount === 1) {
        console.log("Successfully deleted one document.");
      } else {
        console.log("No documents matched the query. Deleted 0 documents.");
      }
    })  

    app.delete('/reviewFoodDel/:id', async (req, res) => {
      const id=req.params.id;
      console.log('please delete from database',id);
      const query = { _id: new ObjectId(id) };
      const result = await review_Collection.deleteOne(query);
      res.send(result);
      if (result.deletedCount === 1) {
        console.log("Successfully deleted one document.");
      } else {
        console.log("No documents matched the query. Deleted 0 documents.");
      }
    })  
    app.delete('/menuItemDel/:id', async (req, res) => {
      const id=req.params.id;
      console.log('please delete from database',id);
      const query = { _id: new ObjectId(id) };
      const result = await meal_collection.deleteOne(query);
      res.send(result);
      if (result.deletedCount === 1) {
        console.log("Successfully deleted one document.");
      } else {
        console.log("No documents matched the query. Deleted 0 documents.");
      }
    })  
    app.delete('/UpcomingMenuItemDel/:id', async (req, res) => {
      const id=req.params.id;
      console.log('please delete from database',id);
      const query = { _id: new ObjectId(id) };
      const result = await upcomeing_meal_collection.deleteOne(query);
      res.send(result);
      if (result.deletedCount === 1) {
        console.log("Successfully deleted one document.");
      } else {
        console.log("No documents matched the query. Deleted 0 documents.");
      }
    })  

    app.get('/UpdateReview/:id',async(req,res)=>{
      const id=req.params.id;
      console.log('please send data from database',id);
      const query = { _id: new ObjectId(id) };
      const result = await review_Collection.findOne(query);
      res.send(result);
    }) 
    app.get('/menuItem/:id',async(req,res)=>{
      const id=req.params.id;
      console.log('please send data from database',id);
      const query = { _id: new ObjectId(id) };
      const result = await meal_collection.findOne(query);
      res.send(result);
    }) 

    app.get('/upcomingMeal',async(req,res)=>{
      const cursor= upcomeing_meal_collection.find();
      const result=await cursor.toArray();
      res.send(result);
    })

    //PAYMENT
    app.post("/create-payment-intent", async (req, res) => {
      const { price } = req.body;
      const amount= parseInt(price*100);
      console.log(amount,'amount intent');
      // Create a PaymentIntent with the order amount and currency
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency: "usd",
        payment_method_types:['card']
        // In the latest version of the API, specifying the `automatic_payment_methods` parameter is optional because Stripe enables its functionality by default.
      });

      res.send({
        clientSecret: paymentIntent.client_secret,
      });
    });

      app.post('/payments', async (req, res) => {
      const payment = req.body;
      const paymentResult = await paymentCollection.insertOne(payment);
      //  carefully delete each item from the cart
      console.log('payment info', payment);
      res.send({ paymentResult });
    })
    app.get('/userInput', async (req, res) => {
      const userInputQuery = req.query;
      let query={};
        if(userInputQuery?.input){
          query={
            $or: [
              { email: userInputQuery.input },
              { name: userInputQuery.input }
            ]
          }
        } 
      const cursor= await userCollection.find(query).toArray();
      console.log('test info', cursor );
      res.send(cursor);
    })
      app.get('/userInputFood', async (req, res) => {
      const userInputQuery = req.query;
      let query={};
        if(userInputQuery?.input){
          query={
            $or: [
              { user_name: userInputQuery.input },
              { user_email: userInputQuery.input }
            ]
          }
        } 
      const cursor= await req_food_Collection.find(query).toArray();
      //const paymentResult = await paymentCollection.insertOne(payment);
      //  carefully delete each item from the cart
      console.log('test info', cursor );
      res.send(cursor);
    })

    app.post('/meal', async (req, res) => {
      const meal = req.body;
      const result = await meal_collection.insertOne(meal);
      res.send(result);
    })
    app.post('/requestFood', async (req, res) => {
      const order = req.body;
      const result = await req_food_Collection.insertOne(order );
      res.send(result);
    })
    app.post('/review', async (req, res) => {
      const reviews = req.body;
      const result = await review_Collection.insertOne(reviews);
      res.send(result);
    })
    app.post('/upcomingMealSave', async (req, res) => {
      const savedMeal = req.body;
      const result = await upcomingMeal_Like_Collection.insertOne(savedMeal);
      res.send(result);
    })

    app.get('/review',async(req,res)=>{
      const cursor= review_Collection.find();
      const result=await cursor.toArray();
      res.send(result);
    })

    app.get('/upcomingMealSave',async(req,res)=>{
      const cursor= upcomingMeal_Like_Collection.find();
      const result=await cursor.toArray();
      res.send(result);
    })


    app.get('/mealDetails/:id',async(req,res)=>{
      const id=req.params.id;
      const query={_id:new ObjectId(id)};
      const result=await meal_collection.findOne(query);
      res.send(result);
    })

    app.put('/mealReview/:id', async (req, res) => {
      const id=req.params.id;
      const result=await meal_collection.updateOne(
        { _id: new ObjectId(id) },
        { $inc: { "review_count":1 } }
      )
      res.send(result);
    })
    app.put('/reviewsDecUpdate/:id', async (req, res) => {
      const id=req.params.id;
      const result=await meal_collection.updateOne(
        { _id: new ObjectId(id) },
        { $inc: { "review_count":-1 } }
      )
      res.send(result);
    })
    app.put('/mealLike/:id', async (req, res) => {
      const id=req.params.id;
      const result=await meal_collection.updateOne(
        { _id: new ObjectId(id) },
        { $inc: { "like_count":1 } }
      )
      res.send(result);
    })

        //update reviews from database
        app.put('/reviewsUpdate/:id', async (req, res) => {
          const id=req.params.id;
          const updatedData=req.body;
          const query = { _id: new ObjectId(id) };
          const options = { upsert: true };
          const updateDoc = {
          $set: {
            review:updatedData.review,
            }
          }
          const result = await review_Collection.updateOne(query,updateDoc,options);
          res.send(result);
        })

        app.put('/mealUpdate/:id', async (req, res) => {
          const id=req.params.id;
          const updatedData=req.body;
          const query = { _id: new ObjectId(id) };
          const options = { upsert: true };
          const updateDoc = {
          $set: {
            meal_title:updatedData.meal_title,
            meal_rating:updatedData.meal_rating,
            category:updatedData.category,
            price:updatedData.price,
            description:updatedData.description,
            meal_ingredients:updatedData.meal_ingredients,
            like_count:updatedData.like_count,
            review_count:updatedData.review_count,
            admin_name:updatedData.admin_name,
            admin_email:updatedData.admin_email,
            date:updatedData.date,
            image:updatedData.image,
            }
          }
          const result = await meal_collection.updateOne(query,updateDoc,options);
          res.send(result);
        })



    app.put('/upcomingMealLike/:id', async (req, res) => {
      const id=req.params.id;
      const result=await upcomeing_meal_collection.updateOne(
        { _id: new ObjectId(id) },
        { $inc: { "like_count":1 } }
      )
      res.send(result);
    })
    
    app.post('/upcomingMeal', async (req, res) => {
      const meal = req.body;
      const result = await upcomeing_meal_collection.insertOne(meal);
      res.send(result);
    })


    app.get('/membershipPackage/:name',async(req,res)=>{
      const package_name=req.params.name;
      const query={name:package_name};
      const result=await membership_package_collection.findOne(query);
      res.send(result);
    })

    app.get('/users',async(req,res)=>{
        //console.log(req.headers);     
        const cursor= userCollection.find();
        const result=await cursor.toArray();
        //console.log(cursor);
        res.send(result);
      })
      app.get('/users/:email',async(req,res)=>{
        //console.log(req.headers);  
        const email=req.params.email;
        const query={email:email};
        const user= await userCollection.findOne(query);   
        //const result=await user.toArray();
        //console.log(cursor);
        res.send(user);
      })  
      app.get('/mealCount/:email',async(req,res)=>{
        //console.log(req.headers);  
        const email=req.params.email;
        const query={admin_email:email};
       // const meal= await meal_collection.findOne(query);
        const cursor= await  meal_collection.find(query).toArray();  
        console.log(cursor); 
        res.send(cursor);
        
      })  

      app.put('/users/:email', async (req, res) => {
        const email=req.params.email;
        const query={email:email};
        const updatedBadge=req.body;
        const options = { upsert: true };
        const updateDoc = {
        $set: {
          badge:updatedBadge.badge,
              }
        }
        const result = await userCollection.updateOne(query,updateDoc,options);
        res.send(result);
      })


    app.post('/users', async (req, res) => {
      const user = req.body;
      const query = { email: user.email }
      const existingUser = await userCollection.findOne(query);
      if (existingUser) {
        return res.send({ message: 'user already exists', insertedId: null })
      }
      const result = await userCollection.insertOne(user);
      res.send(result);
    });

      app.patch('/users/admin/:id',async(req,res)=>{
        const id=req.params.id;
        const filter={_id:new ObjectId(id)};
        const updateDoc={
          $set:{
            role:'admin'
          }
        }
        const result=await userCollection.updateOne(filter,updateDoc);
        res.send(result);
      })
      app.patch('/foodDelivered/:id',async(req,res)=>{
        const id=req.params.id;
        const filter={_id:new ObjectId(id)};
        const updateDoc={
          $set:{
            status:'delivered'
          }
        }
        const result=await req_food_Collection.updateOne(filter,updateDoc);
        res.send(result);
      })

        app.get('/users/admin/:email',async(req,res)=>{
        const email=req.params.email;
        const query={email:email};
        const user= await userCollection.findOne(query);
        console.log('found user admin',user);
        let admin=false;
        if(user){
          admin=user.role==='admin';
        }
        res.send({admin});
      })






    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
   // await client.close()
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('Hello World!HostelHub is listening')
})

app.listen(port, () => {
  console.log(`HostelHub app listening on port ${port}`)
})