const express = require("expree");
const app = express(); 


app.get("/", (req, res) => {
    res.json({
        message: "Testing API"
    });
});

app.listen(3000, () => {
    console.log(`Server running on port: 3000`)
})