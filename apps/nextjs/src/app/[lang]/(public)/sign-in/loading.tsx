import { getT } from "~/i18n/server";

export default async function SignInLoading() {
  const { t } = await getT();
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-gray-900" />
        <p className="mt-4 text-gray-600">{t("common.loading")}</p>
      </div>
    </div>
  );
}
