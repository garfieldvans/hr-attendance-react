import { join } from 'node:path';

export const uploadDirectory = () => join(process.cwd(), process.env.UPLOAD_DIR ?? 'uploads');
