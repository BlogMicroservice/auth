import express, { Request, Response } from 'express';
import { errorHandler } from './utils/ErrorHandler';
import { signupRouter } from './routes/SignupRouter';
import { loginRouter } from './routes/LoginRoute';
import { logout } from './controllers/logout';
const app = express();
app.use(express.json());

app.use('/signup', signupRouter);
app.use('/login', loginRouter);
app.post("/logout",logout)
app.get('/', (req: Request, res: Response) => {
  res.json('hi from auth services');
});

export default app;
