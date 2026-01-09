import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from './authOptions';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  if (session) {
    res.status(200).json({ message: 'You are authenticated', session });
  } else {
    res.status(401).json({ message: 'You are not authenticated' });
  }
}