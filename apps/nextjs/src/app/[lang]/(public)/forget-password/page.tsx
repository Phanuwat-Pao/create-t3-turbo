import type { Locale } from "~/i18n/i18n-config";

import { getDictionary } from "~/i18n/get-dictionary";

import ForgetPasswordPage from "./_components/forget-password-page";

interface PageProps {
  params: Promise<{ lang: Locale }>;
}

export default async function Page({ params }: PageProps) {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  return <ForgetPasswordPage dict={dict} />;
}
