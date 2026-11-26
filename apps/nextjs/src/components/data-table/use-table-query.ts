"use client";

import type {
  DataTablePaging,
  PaginationState,
  SortingState,
} from "@acme/ui/data-table";
import { DEFAULT_PAGE_SIZE, PAGE_SIZES } from "@acme/validators/paging";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";

/** How long typing pauses before the search goes to the server. */
const SEARCH_DELAY_MS = 300;

interface Sort<Id extends string> {
  desc: boolean;
  id: Id;
}

/**
 * What a server-paged data table asks the API for: the page (from 1), the
 * page size, the sort column and a search that waits for typing to pause. A
 * new sort or search goes back to page 1.
 */
export function useTableQuery<const Id extends string>({
  columns,
  pageSize = DEFAULT_PAGE_SIZE,
  sort,
}: {
  /** The columns the API sorts on. */
  columns: readonly Id[];
  pageSize?: number;
  sort: Sort<Id>;
}) {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize,
  });
  const [sorting, setSorting] = useState<SortingState>([sort]);
  const [searchText, setSearchText] = useState("");
  const [search, setSearch] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const firstPage = () => {
    setPagination((current) => ({ ...current, pageIndex: 0 }));
  };
  const changeSearch = (value: string) => {
    setSearchText(value);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setSearch(value.trim());
      firstPage();
    }, SEARCH_DELAY_MS);
  };
  const [current] = sorting;
  const id = columns.find((column) => column === current?.id) ?? sort.id;

  return {
    /** Back to page 1, for filters outside the table. */
    firstPage,
    input: {
      page: pagination.pageIndex + 1,
      pageSize: pagination.pageSize,
      search: search || undefined,
      sort: { desc: current?.desc ?? sort.desc, id },
    },
    pagination,
    search: { handleChange: changeSearch, value: searchText },
    setPagination,
    sorting: {
      onChange: (
        updater: SortingState | ((old: SortingState) => SortingState)
      ) => {
        setSorting(updater);
        firstPage();
      },
      state: sorting,
    },
  };
}

/** The pager's words in the page's language. */
export function usePagingLabels(): DataTablePaging["labels"] {
  const { t } = useTranslation();
  return {
    first: t("dataTable.first"),
    last: t("dataTable.last"),
    next: t("dataTable.next"),
    pager: t("dataTable.pager"),
    previous: t("dataTable.previous"),
    range: (from, to, total) => t("dataTable.range", { from, to, total }),
    rowsPerPage: t("dataTable.rowsPerPage"),
  };
}

/** The `paging` prop of a server-paged table. */
export function usePaging(
  query: Pick<ReturnType<typeof useTableQuery>, "pagination" | "setPagination">,
  rowCount: number
): DataTablePaging {
  return {
    labels: usePagingLabels(),
    onPaginationChange: query.setPagination,
    pageSizes: PAGE_SIZES,
    pagination: query.pagination,
    rowCount,
  };
}
