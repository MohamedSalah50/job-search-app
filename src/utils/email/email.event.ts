import { EventEmitter } from 'events';
import Mail from 'nodemailer/lib/mailer';
import { verifyEmailTemplate } from '../email/template.email';
import { sendEmail } from './send.email';
import { ApplicationStatusEnum, OtpEnum } from 'src/common';
import {
  getAcceptanceEmailTemplate,
  getRejectionEmailTemplate,
} from './statusTemplate.email';

export interface IEmail extends Mail.Options {
  otp: string;
}

export interface IApplicationEmail extends Mail.Options {
  userName: string;
  companyName: string;
  jobTitle: string;
  status: ApplicationStatusEnum;
}

export const emailEmitter = new EventEmitter();

emailEmitter.on(OtpEnum.confirmEmail, async (data: IEmail) => {
  try {
    data.subject = OtpEnum.confirmEmail;
    data.html = verifyEmailTemplate(data.otp, data.subject);
    await sendEmail(data);
  } catch (err) {
    console.error('❌ email failed:', err);
  }
});

emailEmitter.on(OtpEnum.forgotPassword, async (data: IEmail) => {
  try {
    data.subject = OtpEnum.forgotPassword;
    data.html = verifyEmailTemplate(data.otp, data.subject);
    await sendEmail(data);
  } catch (err) {
    console.error('❌ email failed:', err);
  }
});

emailEmitter.on(
  ApplicationStatusEnum.ACCEPTED,
  async (data: IApplicationEmail) => {
    try {
      const emailTemplate = getAcceptanceEmailTemplate({
        userName: data.userName,
        jobTitle: data.jobTitle,
        companyName: data.companyName,
      });

      data.subject = emailTemplate.subject;
      data.html = emailTemplate.html;

      await sendEmail(data);

      console.log(`✅ Acceptance email sent to ${data.to}`);
    } catch (err) {
      console.error('❌ Acceptance email failed:', err);
    }
  },
);

emailEmitter.on(
  ApplicationStatusEnum.REJECTED,
  async (data: IApplicationEmail) => {
    try {
      const emailTemplate = getRejectionEmailTemplate({
        userName: data.userName,
        jobTitle: data.jobTitle,
        companyName: data.companyName,
      });

      data.subject = emailTemplate.subject;
      data.html = emailTemplate.html;

      await sendEmail(data);

      console.log(`✅ Rejection email sent to ${data.to}`);
    } catch (err) {
      console.error('❌ Rejection email failed:', err);
    }
  },
);
