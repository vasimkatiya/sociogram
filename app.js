const cookieParser = require('cookie-parser');
const express = require('express');
const authRouter = require('./routes/auth');
const postRouter = require('./routes/posts');
const { authValid } = require('./middleware/auth');
require('dotenv').config();

const port = process.env.PORT || 3000 ;

const app = express();


app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({extended:false}));

app.use('/api/auth',authRouter);
app.use('/api/users',postRouter);

app.listen(port,()=>{
    console.log('server is running...')
})