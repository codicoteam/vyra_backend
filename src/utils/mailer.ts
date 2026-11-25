import nodemailer from 'nodemailer';
import { prisma } from '../config/prisma';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const FROM = () => `"VYRA" <${process.env.EMAIL_USER}>`;

export async function sendVerificationCode(to: string, code: string) {
  await transporter.sendMail({
    from: FROM(),
    to,
    subject: 'Your VYRA verification code',
    text: `Your verification code is ${code}. It expires in 10 minutes.`,
  });
}
export async function sendResetCode(to: string, code: string) {
  await transporter.sendMail({
    from: FROM(),
    to,
    subject: 'Your VYRA password reset code',
    text: `Your password reset code is ${code}. It expires in 15 minutes. If you didn't ask for this, ignore this email.`,
  });
}

/* ------------------------------------------------------------------ */
/* Publish notifications                                               */
/* ------------------------------------------------------------------ */

// Shared account used by /anonymous/publish – never email it.
const ANONYMOUS_ACCOUNT_EMAIL = 'anonymous@vyra.com';

const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

const storyUrl = (postId: string) => {
  const base = (process.env.FRONTEND_URL || 'http://localhost:3000').replace(/\/+$/, '');
  return `${base}/#/story/${postId}`; // frontend uses hash routing
};

interface EmailLayout {
  preheader: string;
  heading: string;
  intro: string;
  title: string;
  excerpt?: string | null;
  coverImage?: string | null;
  meta: string;
  ctaLabel: string;
  ctaUrl: string;
  footnote: string;
}

function renderEmail(l: EmailLayout): string {
  const cover = l.coverImage && /^https?:\/\//i.test(l.coverImage)
    ? `<img src="${escapeHtml(l.coverImage)}" alt="" width="520" style="display:block;width:100%;max-width:520px;height:auto;border-radius:12px;margin:0 0 20px;" />`
    : '';
  const excerpt = l.excerpt
    ? `<p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:#475569;">${escapeHtml(l.excerpt)}</p>`
    : '';

  return `<!doctype html>
<html><body style="margin:0;padding:0;background:#F4F3FA;font-family:-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
<span style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(l.preheader)}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F4F3FA;padding:32px 12px;">
  <tr><td align="center">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:18px;overflow:hidden;box-shadow:0 8px 30px rgba(76,29,149,0.08);">
      <tr><td style="background:linear-gradient(120deg,#6D28D9,#4F46E5 60%,#06B6D4);background-color:#6D28D9;padding:28px 40px;">
        <span style="font-size:24px;font-weight:800;letter-spacing:-0.5px;color:#ffffff;">VYRA</span>
      </td></tr>
      <tr><td style="padding:36px 40px 12px;">
        <h1 style="margin:0 0 8px;font-size:22px;line-height:1.3;color:#0F172A;">${escapeHtml(l.heading)}</h1>
        <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#475569;">${escapeHtml(l.intro)}</p>
        ${cover}
        <h2 style="margin:0 0 10px;font-size:20px;line-height:1.35;color:#0F172A;">${escapeHtml(l.title)}</h2>
        ${excerpt}
        <p style="margin:0 0 28px;font-size:13px;color:#94A3B8;">${escapeHtml(l.meta)}</p>
        <a href="${escapeHtml(l.ctaUrl)}" style="display:inline-block;background:#6D28D9;color:#ffffff;text-decoration:none;font-weight:600;font-size:15px;padding:13px 26px;border-radius:12px;">${escapeHtml(l.ctaLabel)}</a>
      </td></tr>
      <tr><td style="padding:28px 40px 36px;">
        <p style="margin:0;font-size:12px;line-height:1.6;color:#94A3B8;border-top:1px solid #F1F3F9;padding-top:20px;">${escapeHtml(l.footnote)}</p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>`;
}

async function sendPublishEmails(postId: string) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('[mailer] EMAIL_USER / EMAIL_PASS not set – skipping publish emails');
    return;
  }

  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: {
      author: { select: { id: true, email: true, fullName: true, username: true, emailNotifications: true, isBanned: true } },
      category: { select: { name: true } },
    },
  });
  if (!post || post.status !== 'PUBLISHED') return;

  const url = storyUrl(post.id);
  const category = post.category?.name || 'Uncategorized';
  const author = post.author;
  const jobs: Promise<unknown>[] = [];

  // 1. Author confirmation
  if (
    author &&
    author.email &&
    author.email !== ANONYMOUS_ACCOUNT_EMAIL &&
    author.emailNotifications &&
    !author.isBanned
  ) {
    jobs.push(
      transporter.sendMail({
        from: FROM(),
        to: author.email,
        subject: `Your story is live: ${post.title}`,
        text: `Hi ${author.fullName},\n\nYour story "${post.title}" has been published on VYRA${post.isAnonymous ? ' anonymously' : ''}.\n\nRead it here: ${url}\n\n— The VYRA team`,
        html: renderEmail({
          preheader: `"${post.title}" is now published on VYRA.`,
          heading: 'Your story is live 🎉',
          intro: `Hi ${author.fullName}, your story has been published${post.isAnonymous ? ' anonymously — your name is not shown to readers' : ''}.`,
          title: post.title,
          excerpt: post.excerpt,
          coverImage: post.coverImageUrl,
          meta: `${category} · Published ${new Date(post.publishedAt ?? Date.now()).toUTCString()}`,
          ctaLabel: 'View your story',
          ctaUrl: url,
          footnote: 'You received this because you published on VYRA. You can turn off email notifications in your account settings.',
        }),
      }),
    );
  }

  // 2. Admin alert
  const admins = await prisma.user.findMany({
    where: { role: 'ADMIN' as any, isBanned: false },
    select: { email: true },
  });
  const extra = (process.env.ADMIN_NOTIFY_EMAILS || '').split(',').map((e) => e.trim()).filter(Boolean);
  const adminEmails = Array.from(new Set([...admins.map((a) => a.email), ...extra])).filter(
    (e) => e && e !== ANONYMOUS_ACCOUNT_EMAIL && e !== author?.email,
  );

  if (adminEmails.length > 0) {
    // Protect anonymous authors: never reveal identity in admin emails.
    const byline = post.isAnonymous || !author ? 'Anonymous author' : `${author.fullName} (@${author.username})`;
    jobs.push(
      transporter.sendMail({
        from: FROM(),
        to: FROM(), // send to self, admins in BCC so addresses aren't exposed to each other
        bcc: adminEmails,
        subject: `[VYRA] New post published: ${post.title}`,
        text: `A new post was published on VYRA.\n\nTitle: ${post.title}\nBy: ${byline}\nCategory: ${category}\n\nReview it: ${url}`,
        html: renderEmail({
          preheader: `New post by ${byline}`,
          heading: 'New post published',
          intro: 'A new story just went live on VYRA.',
          title: post.title,
          excerpt: post.excerpt,
          coverImage: post.coverImageUrl,
          meta: `By ${byline} · ${category}${post.isAnonymous ? ' · Anonymous' : ''}`,
          ctaLabel: 'Review post',
          ctaUrl: url,
          footnote: 'You received this because you are a VYRA administrator.',
        }),
      }),
    );
  }

  const results = await Promise.allSettled(jobs);
  results.forEach((r) => {
    if (r.status === 'rejected') console.error('[mailer] publish email failed:', r.reason?.message || r.reason);
  });
}

/**
 * Fire-and-forget: send "post published" emails to the author and admins.
 * Never throws and never delays the HTTP response.
 */
export function notifyPostPublished(postId: string): void {
  sendPublishEmails(postId).catch((err) =>
    console.error('[mailer] notifyPostPublished error:', err?.message || err),
  );
}
