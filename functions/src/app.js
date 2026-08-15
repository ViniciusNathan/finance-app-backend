import express from 'express'
import routes from './routes/index.js'

const app = express()

app.use(express.json()) //middleware que intercepta toda a requisição que chega e olha se está em formato JSON se sim transforma em objeto JS e disponibiliza para req.body
app.use('/', routes)

export default app