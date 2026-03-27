
const cookieParser = require('cookie-parser');
const express = require('express');
const authRouter = require('./routes/auth');
const postRouter = require('./routes/posts');
const commentRouter = require('./routes/comments');
require('dotenv').config();

const port = process.env.PORT || 3000 ;

const app = express();


app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({extended:false}));

app.use('/api/auth',authRouter);
app.use('/api',commentRouter)
app.use('/api',postRouter);

app.listen(port,()=>{
    console.log('server is running...')
})