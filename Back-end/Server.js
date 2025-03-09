const express = require("express");
const cors = require("cors");


const app = express();
const Port = 3000;

app.use(express.json());
app.use(cors());



app.listen(Port, () => {
    console.log(`Server is running on port ${Port}`);
});
