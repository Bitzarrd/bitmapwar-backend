import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

export const config = {
  api: {
    responseLimit: false,
  },
};

export default function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  const { gitVersion } = req.query;
  const filePath = path.join(process.cwd(), 'public/unity_webgl_player/' + gitVersion + '/', 'web.data');

  fs.readFile(filePath, 'binary', (err, data) => {
    if (err) {
      console.error('Error reading file:', err);
      res.status(500).json({ message: 'Internal Server Error' });
    } else {
      res.setHeader('Content-Type', 'application/octet-stream');
      console.log('web.data', data.length);
      res.setHeader('Content-Length', data.length);
      res.status(200).send(data);
    }
  });
}
