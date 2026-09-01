export interface EmailMessage {
  to: string;
  from: string;
  replyTo?: string;
  subject: string;
  text: string;
}

export interface EmailSender {
  name: string;
  send(message: EmailMessage): Promise<{ ok: true }>;
}
