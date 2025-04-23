import express, { Application, Request, Response } from 'express'

const app: Application = express()

app.get('/test', (req, res) => {
res.send("test ok")

})

const port = process.env.PORT ? Number(process.env.PORT) : 3000;
app.listen(port, () => {
    console.log(`🚀 Server running at http://localhost:${port}`);
})