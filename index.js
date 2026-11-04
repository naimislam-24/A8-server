import express from "express";
import { MongoClient, ObjectId } from "mongodb";
import cors from "cors";
const PORT = 5000;
import "dotenv/config";

const app = express();
// app.use(cors());
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use(express.json());

const client = new MongoClient(process.env.MONGO_URI);
export async function connectToMongoDB() {
  try {
    await client.connect();
    console.log("You successfully connected to MongoDB!");
    return client;
  } catch (err) {
    console.dir(err);
  }
}
const connectClient = await connectToMongoDB();
const db = connectClient.db("conceptual-mileston-8");
const facilitiesCollection = db.collection("facilities");
const facilitiesBookingCollection = db.collection("facilitiesBooking");
// const bookingCollention = db.collection("bookings");

app.post("/facilities", async (req, res) => {
  const facilityData = req.body;
  const result = await facilitiesCollection.insertOne(facilityData);
  res.send(result);
});

app.get("/facilities", async (req, res) => {
  const result = await facilitiesCollection.find().toArray();
  res.send(result);
});

app.get("/facilities/:id", async (req, res) => {
  const id = req.params.id;
  const result = await facilitiesCollection.findOne({
    _id: new ObjectId(id),
  });
  res.send(result);
});

app.post("/facilities/bookings", async (req, res) => {
  const bookingData = req.body;
  const result = await facilitiesBookingCollection.insertOne(bookingData);
  res.send(result);
});

app.get("/my-facilities/:email", async (req, res) => {
  const email = req.params.email;
  const result = await facilitiesCollection
    .find({ creatorEmail: email })
    .toArray();
  res.send(result);
});

// app.get("/test", (req, res) => {
//   res.json({ message: "Hello World!" });
// });

// http://localhost:5000
app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
