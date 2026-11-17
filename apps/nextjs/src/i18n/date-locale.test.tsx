import { Calendar } from "@acme/ui/calendar";
import { format } from "date-fns";
import { renderToStaticMarkup } from "react-dom/server";

import { dateLocales } from "./date-locale";

const NOVEMBER_2026 = new Date(2026, 10, 1);

function renderCalendar(locale: keyof typeof dateLocales): string {
  return renderToStaticMarkup(
    <Calendar
      captionLayout="dropdown"
      locale={dateLocales[locale]}
      month={NOVEMBER_2026}
    />
  );
}

describe("dateLocales", () => {
  it("renders the calendar in Thai, labels included", () => {
    const html = renderCalendar("th");
    expect(html).toContain('lang="th"');
    // Month dropdown and caption.
    expect(html).toContain("พ.ย.");
    expect(html).toContain("พฤศจิกายน");
    expect(html).toContain('aria-label="ไปเดือนถัดไป"');
    expect(html).toContain('aria-label="ไปเดือนก่อนหน้า"');
    expect(html).not.toContain("November");
  });

  it("renders the calendar in English", () => {
    const html = renderCalendar("en");
    expect(html).toContain("November");
    expect(html).toContain('aria-label="Go to the Next Month"');
  });

  it("formats picked dates with date-fns in the page language", () => {
    expect(format(NOVEMBER_2026, "PPP", { locale: dateLocales.th })).toContain(
      "พฤศจิกายน"
    );
    expect(format(NOVEMBER_2026, "PPP", { locale: dateLocales.en })).toBe(
      "November 1st, 2026"
    );
  });
});
