import { withIronSessionApiRoute } from 'iron-session/next';
import { NextApiRequest, NextApiResponse } from 'next';
import withHandler, { ResponseType } from '@libs/server/withHandler';
import client from '@libs/client/client';

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseType>,
) {
  const { token } = req.body;
  const exists = await client.token.findUnique({
    where: {
      payload: token,
    },
  });

  if (!exists)
    return res.status(404).json({
      ok: false,
    });

  req.session.user = {
    id: exists?.userId,
  };
  await req.session.save();

  return res.json({
    ok: true,
  });
}

export default withIronSessionApiRoute(withHandler('POST', handler), {
  cookieName: 'carrotsession',
  password: process.env.COOKIE_PASSWORD!,
});
