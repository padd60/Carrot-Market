import { withIronSessionApiRoute } from 'iron-session/next';
import { NextApiRequest, NextApiResponse } from 'next';

declare module 'iron-session' {
  interface IronSessionData {
    user?: {
      id: number;
    };
  }
}

const cookieOptions = {
  cookieName: 'carrotsession',
  password: process.env.COOKIE_PASSWORD!,
};

export function withApiSession(
  fn: (req: NextApiRequest, res: NextApiResponse) => Promise<any>,
) {
  return withIronSessionApiRoute(fn, cookieOptions);
}
