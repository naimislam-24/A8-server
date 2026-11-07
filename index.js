import express from "express";
import { MongoClient, ObjectId } from "mongodb";
import cors from "cors";
const PORT = 5000;
import "dotenv/config";
import { createRemoteJWKSet, jwtVerify } from "jose";

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

const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send({ msg: "Unauthorized!" });
  }
  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).send({ msg: "Unauthorized!" });
  }
  const JWKS = createRemoteJWKSet(
    new URL("http://localhost:3000/api/auth/jwks"),
  );
  try {
    const { payload } = await jwtVerify(token, JWKS);
    // payload ta vinno jaygay use korbo
    next();
  } catch (error) {
    return res.status(500).send({ msg: "Server Error" });
  }
};

app.post("/facilities", verifyToken, async (req, res) => {
  const facilityData = req.body;
  const result = await facilitiesCollection.insertOne(facilityData);
  res.send(result);
});

app.get("/facilities", async (req, res) => {
  const result = await facilitiesCollection.find().toArray();
  res.send(result);
});

app.get("/facilities/:id", verifyToken, async (req, res) => {
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

// Update Data
app.patch("/facilities/:id", async (req, res) => {
  const id = req.params;
  const updateData = req.body;
  const result = await facilitiesCollection.updateOne(
    { _id: new ObjectId(id) },
    { $set: updateData },
  );
  res.json(result);
});

// Delete Data
app.delete("/facilities/:id", async (req, res) => {
  const id = req.params;
  const result = await facilitiesCollection.deleteOne({
    _id: new ObjectId(id),
  });
  res.json(result);
});

// Joined Events
app.get("/facilities/bookings/:email", async (req, res) => {
  const email = req.params.email;
  const result = await facilitiesBookingCollection
    .find({ userEmail: email })
    .toArray();
  res.send(result);
});

// Joined Events
// app.delete("/facilities/:id", async (req, res) => {
//   const id = req.params;
//   const result = await facilitiesCollection.deleteOne({
//     _id: new ObjectId(id),
//   });
//   res.json(result);
// });

// app.get("/test", (req, res) => {
//   res.json({ message: "Hello World!" });
// });

app.get("/facilitiess/upcoming", async (req, res) => {
  const today = new Date().toISOString().split("T")[0];

  const result = await facilitiesCollection
    .find({ date: { $gte: today } })
    .sort({ date: 1 })
    .limit(6)
    .toArray();

  res.send(result);
});

// app.get("/facilitiess", async (req, res) => {
//   const result = await facilitiesCollection.find().toArray();
//   res.send(result);
// });

// http://localhost:5000
app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
