
const cookieParser = require('cookie-parser');
const express = require('express');
const authRouter = require('./routes/auth');
const postRouter = require('./routes/posts');
const commentRouter = require('./routes/comments');
const likeRouter = require('./routes/likes');
const searchRouter = require('./routes/search');
const userRouter = require('./routes/profile');
const followRouter = require('./routes/follow');
require('dotenv').config();

const port = process.env.PORT || 3000 ;

const app = express();


app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({extended:false}));

app.use('/api/auth',authRouter);
app.use('/api',commentRouter)
app.use('/api',postRouter);
app.use('/api',likeRouter);
app.use('/api/users',searchRouter)
app.use('/api/users',userRouter);
app.use('/api',followRouter)

app.listen(port,()=>{
    console.log('server is running...')
})