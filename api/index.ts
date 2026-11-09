import app from '../backend/src/index';

export default function handler(req: any, res: any) {
  // Ensure the /api prefix is present so Express routes match correctly
  if (req.url && !req.url.startsWith('/api')) {
    req.url = '/api' + req.url;
  }
  return app(req, res);
}
