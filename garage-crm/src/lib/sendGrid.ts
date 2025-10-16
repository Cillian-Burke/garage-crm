// src/lib/sendgrid.ts
import sg from '@sendgrid/mail';
sg.setApiKey(process.env.SENDGRID_API_KEY!);
export default sg;