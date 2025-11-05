import request from 'supertest';
import express from 'express';
import bodyParser from 'body-parser';
import { bodyDecipher } from '../../../middlewares/req-res-encoder';
import { tokenVerificationForV4 } from '../../../middlewares/authenticate';
import userRouteForV4 from "../../routes/user/index.route";
import routesVersionFour from '../../routes/index.route';
import adminRouteForV4 from "../../routes/admin/index.route";

const app = express();
app.use(bodyParser.json());
app.use("/api/v4/user", [bodyDecipher, tokenVerificationForV4], userRouteForV4());
app.use("/api/v4", [bodyDecipher, tokenVerificationForV4], routesVersionFour());
app.use("/api/v4/admin", [bodyDecipher, tokenVerificationForV4], adminRouteForV4());

describe('Auth Controller - login', () => {
  it('should return token for valid credentials', async () => {
    const res = await request(app)
      .post('/api/v4/user/login')
        .set('Authorization', process.env.PUBLIC_AUTHORIZATION_TOKEN) // <-- Add this line
      .send({ username: 'javiyavandan@gmail.com', password: 'Winner@6431$$$', company_key: 'STELIOSJ' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message', 'success');

  });

  it('should return 401 for invalid credentials', async () => {
    const res = await request(app)
      .post('/api/v4/user/login')
      .set('Authorization', process.env.PUBLIC_AUTHORIZATION_TOKEN) // <-- Add this line
    .send({ username: 'admin', password: 'admin', company_key: 'STELIOSJ' });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('message','Bad request!');
  });
});

