import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

export const config = {
  api: {
    responseLimit: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  const { gitVersion } = req.query;
  const filePath = path.join(process.cwd(), 'public/unity_webgl_player/' + gitVersion + '/', 'web.wasm');

  // const data = fs.readFileSync(filePath);
  // const dataSize = data.length;
  // console.log('data_size:', dataSize);
  // res.setHeader('Content-Type', 'application/wasm');
  // res.setHeader('Content-Length', dataSize);
  // res.status(200).send(data);

  const stats = await fs.promises.stat(filePath);
  console.log(stats.size);
  res.writeHead(200, {
    'Content-Disposition': `attachment; filename=${path.basename(filePath)}`,
    'Content-Type': 'application/wasm',
    'Content-Length': stats.size,
  });
  await new Promise(function (resolve) {
    const nodeStream = fs.createReadStream(filePath);
    nodeStream.pipe(res);
    nodeStream.on('end', resolve);
  });

  // const stream = fs.createReadStream(filePath);
  // //
  // res.setHeader('Content-Type', 'application/octet-stream');
  // // res.setHeader('Content-Type', 'application/wasm');
  // res.setHeader('Content-Disposition', 'attachment; filename="web.wasm"');
  // stream.pipe(res);

  // 'binary', (err, data) => {
  //   if (err) {
  //     console.error('Error reading file:', err);
  //     res.status(500).json({ message: 'Internal Server Error' });
  //   } else {
  //     res.setHeader('Content-Type', 'application/wasm');
  //     res.status(200).send(data);
  //   }
  // });
}
