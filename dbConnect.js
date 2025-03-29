import mongoose from "mongoose";
mongoose
  .connect(
    "mongodb+srv://upforex:poeVcnnf1Ksanf5i@cluster0.4ic7bux.mongodb.net/uppforex"
  )
  .then(() => console.log("DB Connected"))
  .catch((err) => console.log("Error in connecting DB ", err));
