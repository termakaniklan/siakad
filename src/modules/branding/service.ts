/**
 * Branding service.
 *
 * Reads/writes the school's visual identity (favicon, login background, logo,
 * site title, primary color) from the `Setting` model under the `branding` key.
 * Server components consume `getBranding()` to render the favicon link tag and
 * background image; the admin panel mutates via `setBranding()`.
 */
import { prisma } from '@/shared/db/prisma';

export interface Branding {
  faviconUrl: string | null;
  loginBackgroundUrl: string | null;
  logoUrl: string | null;
  siteTitle: string | null;
  primaryColor: string | null;
}

const SETTING_KEY = 'branding';

const DEFAULT_BRANDING: Branding = {
  faviconUrl: null,
  loginBackgroundUrl: null,
  logoUrl: null,
  siteTitle: null,
  primaryColor: null,
};

export async function getBranding(): Promise<Branding> {
  try {
    const row = await prisma.setting.findUnique({ where: { key: SETTING_KEY } });
    if (!row) return { ...DEFAULT_BRANDING };
    const v = row.value as Record<string, unknown> | null;
    if (!v || typeof v !== 'object') return { ...DEFAULT_BRANDING };
    return {
      faviconUrl: typeof v.faviconUrl === 'string' ? v.faviconUrl : null,
      loginBackgroundUrl: typeof v.loginBackgroundUrl === 'string' ? v.loginBackgroundUrl : null,
      logoUrl: typeof v.logoUrl === 'string' ? v.logoUrl : null,
      siteTitle: typeof v.siteTitle === 'string' ? v.siteTitle : null,
      primaryColor: typeof v.primaryColor === 'string' ? v.primaryColor : null,
    };
  } catch {
    return { ...DEFAULT_BRANDING };
  }
}

export async function setBranding(patch: Partial<Branding>): Promise<Branding> {
  const current = await getBranding();
  const next: Branding = {
    faviconUrl: patch.faviconUrl ?? current.faviconUrl,
    loginBackgroundUrl: patch.loginBackgroundUrl ?? current.loginBackgroundUrl,
    logoUrl: patch.logoUrl ?? current.logoUrl,
    siteTitle: patch.siteTitle ?? current.siteTitle,
    primaryColor: patch.primaryColor ?? current.primaryColor,
  };
  await prisma.setting.upsert({
    where: { key: SETTING_KEY },
    update: { value: next as unknown as object, category: 'branding' },
    create: { key: SETTING_KEY, value: next as unknown as object, category: 'branding' },
  });
  return next;
}
