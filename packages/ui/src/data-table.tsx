"use client";

/**
 * The shadcn data table on TanStack Table v9. Sorting and paging are always
 * manual: the server sorts, searches and pages (`@acme/validators/paging`),
 * and the table shows the rows it gets. A table without `paging` shows every
 * row it is given, for short lists that never grow.
 */
import { cn } from "@acme/ui";
import {
  createColumnHelper,
  type OnChangeFn,
  type PaginationState,
  type RowData,
  rowPaginationFeature,
  rowSortingFeature,
  type SortingState,
  tableFeatures,
  useTable,
} from "@tanstack/react-table";
import {
  ArrowDown,
  ArrowUp,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ChevronsUpDown,
} from "lucide-react";
import { Fragment } from "react";

import { Button } from "./button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";
import { Skeleton } from "./skeleton";
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./table";

export type {
  PaginationState,
  RowData,
  SortingState,
} from "@tanstack/react-table";

export const dataTableFeatures = tableFeatures({
  rowPaginationFeature,
  rowSortingFeature,
});

export type DataTableFeatures = typeof dataTableFeatures;

/** Column definitions for rows of type `TData`. */
export function dataColumns<TData extends RowData>() {
  return createColumnHelper<DataTableFeatures, TData>();
}

type Columns<TData extends RowData> = ReturnType<
  ReturnType<typeof dataColumns<TData>>["columns"]
>;

/** The parts of a column a sortable header needs. */
interface SortableColumn {
  getCanSort: () => boolean;
  getIsSorted: () => false | "asc" | "desc";
  getToggleSortingHandler: () => ((event: unknown) => void) | undefined;
}

const SORT_ICONS = {
  asc: ArrowUp,
  desc: ArrowDown,
  none: ChevronsUpDown,
} as const;

const ARIA_SORT = {
  asc: "ascending",
  desc: "descending",
  none: "none",
} as const;

/** A column title that sorts the column when clicked. */
export function SortableHeader({
  className,
  column,
  title,
}: {
  className?: string;
  column: SortableColumn;
  title: React.ReactNode;
}) {
  if (!column.getCanSort()) {
    return title;
  }
  const sorted = column.getIsSorted();
  const Icon = SORT_ICONS[sorted || "none"];
  return (
    <button
      className={cn(
        "-mx-1 inline-flex items-center gap-1 rounded px-1 py-0.5 text-left hover:underline focus-visible:ring-2 focus-visible:outline-none",
        className
      )}
      onClick={column.getToggleSortingHandler()}
      type="button"
    >
      {title}
      <Icon
        aria-hidden
        className={cn("size-3.5 shrink-0", sorted ? "" : "opacity-50")}
      />
    </button>
  );
}

export interface DataTablePagingLabels {
  first: string;
  last: string;
  next: string;
  /** The page navigation's accessible name. */
  pager: string;
  previous: string;
  /** "Rows 26 to 50 of 312". */
  range: (from: number, to: number, total: number) => string;
  rowsPerPage: string;
}

export interface DataTablePaging {
  labels: DataTablePagingLabels;
  onPaginationChange: OnChangeFn<PaginationState>;
  pageSizes?: readonly number[];
  pagination: PaginationState;
  /** Rows in the whole list, not just this page. */
  rowCount: number;
}

/** `data-*` attributes, which TypeScript leaves out of the HTML props. */
type DataAttributes = Record<`data-${string}`, string | number | undefined>;

export interface DataTableProps<TData extends RowData> {
  /** Classes on the scrolling box around the table. */
  className?: string;
  /** Classes on a column's cells only, by column id. */
  cellClassName?: Partial<Record<string, string>>;
  /**
   * Classes on a column's header and cells, by column id. Cells wrap by
   * default; `whitespace-nowrap` keeps a column (dates, codes) on one line.
   */
  columnClassName?: Partial<Record<string, string>>;
  /** Classes on a column's header only, by column id. */
  headClassName?: Partial<Record<string, string>>;
  columns: Columns<TData>;
  data: readonly TData[];
  /** Shown in place of the rows when there are none. */
  empty: React.ReactNode;
  getRowId: (row: TData) => string;
  /** Classes on the header row. */
  headerClassName?: string;
  /** No rows yet: skeleton rows. */
  loading?: boolean;
  paging?: DataTablePaging;
  /** Attributes on a row's `<tr>`: test ids, tones. */
  rowProps?: (
    row: TData,
    index: number
  ) => React.ComponentProps<"tr"> & DataAttributes;
  sorting?: { onChange: OnChangeFn<SortingState>; state: SortingState };
  /** A full-width row under a row, when it returns content. */
  renderSubRow?: (row: TData) => React.ReactNode;
  /**
   * The column whose cells name their row: they render as
   * `<th scope="row">`, so assistive tech reads a row by that cell.
   */
  rowHeader?: string;
  /** Props on the `<table>` element. */
  tableProps?: React.ComponentProps<"table"> & DataAttributes;
}

const SKELETON_ROWS = 5;
const NO_CLASSES: Partial<Record<string, string>> = {};
const DEFAULT_PAGE_SIZES = [10, 25, 50, 100] as const;
const PAGE_WINDOW = 5;

/** Up to five page numbers around the current one (1-based). */
export function pageNumbers(page: number, pages: number): number[] {
  const width = Math.min(PAGE_WINDOW, pages);
  const start = Math.min(Math.max(1, page - 2), pages - width + 1);
  return Array.from({ length: width }, (_, index) => start + index);
}

/**
 * Rows per page, which rows are shown, and first, previous, up to five page
 * numbers, next and last.
 */
export function DataTablePagination({
  onPageChange,
  onPageSizeChange,
  paging,
}: {
  onPageChange: (pageIndex: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  paging: DataTablePaging;
}) {
  const { labels, pagination, rowCount } = paging;
  const pageSizes = paging.pageSizes ?? DEFAULT_PAGE_SIZES;
  const pages = Math.max(1, Math.ceil(rowCount / pagination.pageSize));
  const page = Math.min(pagination.pageIndex + 1, pages);
  const from = rowCount === 0 ? 0 : (page - 1) * pagination.pageSize + 1;
  const to = Math.min(page * pagination.pageSize, rowCount);
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground">{labels.rowsPerPage}</span>
        <Select
          onValueChange={(value) => {
            onPageSizeChange(Number(value));
          }}
          value={String(pagination.pageSize)}
        >
          <SelectTrigger
            aria-label={labels.rowsPerPage}
            className="h-8 w-20"
            size="sm"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {pageSizes.map((size) => (
              <SelectItem key={size} value={String(size)}>
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {rowCount > 0 ? (
          <span className="text-muted-foreground tabular-nums">
            {labels.range(from, to, rowCount)}
          </span>
        ) : null}
      </div>
      {pages > 1 ? (
        <nav aria-label={labels.pager} className="flex items-center gap-1">
          <Button
            aria-label={labels.first}
            disabled={page <= 1}
            onClick={() => {
              onPageChange(0);
            }}
            size="icon-sm"
            variant="outline"
          >
            <ChevronsLeft />
          </Button>
          <Button
            aria-label={labels.previous}
            disabled={page <= 1}
            onClick={() => {
              onPageChange(page - 2);
            }}
            size="icon-sm"
            variant="outline"
          >
            <ChevronLeft />
          </Button>
          {pageNumbers(page, pages).map((number) => (
            <Button
              aria-current={number === page ? "page" : undefined}
              className="min-w-8 tabular-nums"
              key={number}
              onClick={() => {
                onPageChange(number - 1);
              }}
              size="sm"
              variant={number === page ? "default" : "outline"}
            >
              {number}
            </Button>
          ))}
          <Button
            aria-label={labels.next}
            disabled={page >= pages}
            onClick={() => {
              onPageChange(page);
            }}
            size="icon-sm"
            variant="outline"
          >
            <ChevronRight />
          </Button>
          <Button
            aria-label={labels.last}
            disabled={page >= pages}
            onClick={() => {
              onPageChange(pages - 1);
            }}
            size="icon-sm"
            variant="outline"
          >
            <ChevronsRight />
          </Button>
        </nav>
      ) : null}
    </div>
  );
}

/** A body cell that names its row. */
function RowHeaderCell(props: React.ComponentProps<"th">) {
  return <TableHead scope="row" {...props} />;
}

export function DataTable<TData extends RowData>({
  cellClassName = NO_CLASSES,
  className,
  columnClassName = NO_CLASSES,
  columns,
  data,
  empty,
  getRowId,
  headClassName = NO_CLASSES,
  headerClassName,
  loading = false,
  paging,
  rowProps,
  sorting,
  renderSubRow,
  rowHeader,
  tableProps,
}: DataTableProps<TData>) {
  const table = useTable({
    columns,
    // useTable takes a mutable array; it never writes to it.
    data: data as TData[],
    enableMultiSort: false,
    enableSorting: sorting !== undefined,
    enableSortingRemoval: false,
    features: dataTableFeatures,
    getRowId: (row) => getRowId(row),
    manualPagination: true,
    manualSorting: true,
    onPaginationChange: paging?.onPaginationChange,
    onSortingChange: sorting?.onChange,
    rowCount: paging?.rowCount ?? data.length,
    state: {
      pagination: paging?.pagination ?? {
        pageIndex: 0,
        pageSize: Math.max(data.length, 1),
      },
      sorting: sorting?.state ?? [],
    },
  });
  const headerGroups = table.getHeaderGroups();
  const columnCount = Math.max(
    1,
    headerGroups[0]?.headers.length ?? columns.length
  );
  const { rows } = table.getRowModel();

  return (
    <div className="grid grid-cols-1 gap-3">
      <div
        className={cn("bg-card overflow-auto rounded-md border", className)}
        data-slot="data-table"
      >
        <table
          {...tableProps}
          className={cn("w-full caption-bottom text-sm", tableProps?.className)}
        >
          <TableHeader className="sticky top-0 z-10">
            {headerGroups.map((group) => (
              <TableRow
                className={cn("hover:bg-transparent", headerClassName)}
                key={group.id}
              >
                {group.headers.map((header) => {
                  const sorted = header.column.getIsSorted();
                  return (
                    <TableHead
                      aria-sort={
                        header.column.getCanSort()
                          ? ARIA_SORT[sorted || "none"]
                          : undefined
                      }
                      className={cn(
                        // Long names wrap, so every column stays in view.
                        "whitespace-normal",
                        columnClassName[header.column.id],
                        headClassName[header.column.id]
                      )}
                      key={header.id}
                    >
                      {header.isPlaceholder ? null : (
                        <table.FlexRender header={header} />
                      )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {loading && rows.length === 0
              ? Array.from({ length: SKELETON_ROWS }, (_, index) => (
                  // oxlint-disable-next-line no-array-index-key -- placeholders have no identity
                  <TableRow key={index}>
                    <TableCell colSpan={columnCount}>
                      <Skeleton className="h-5 w-full" />
                    </TableCell>
                  </TableRow>
                ))
              : null}
            {!loading && rows.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell
                  className="text-muted-foreground h-24 text-center"
                  colSpan={columnCount}
                >
                  {empty}
                </TableCell>
              </TableRow>
            ) : null}
            {rows.map((row) => {
              const extra = renderSubRow?.(row.original);
              return (
                <Fragment key={row.id}>
                  <TableRow {...rowProps?.(row.original, row.index)}>
                    {row.getAllCells().map((cell) => {
                      const Cell =
                        cell.column.id === rowHeader
                          ? RowHeaderCell
                          : TableCell;
                      return (
                        <Cell
                          className={cn(
                            "whitespace-normal",
                            columnClassName[cell.column.id],
                            cellClassName[cell.column.id]
                          )}
                          key={cell.id}
                        >
                          <table.FlexRender cell={cell} />
                        </Cell>
                      );
                    })}
                  </TableRow>
                  {extra ? (
                    <TableRow className="hover:bg-transparent">
                      <TableCell className="bg-muted/40" colSpan={columnCount}>
                        {extra}
                      </TableCell>
                    </TableRow>
                  ) : null}
                </Fragment>
              );
            })}
          </TableBody>
        </table>
      </div>
      {paging ? (
        <DataTablePagination
          onPageChange={(pageIndex) => {
            table.setPageIndex(pageIndex);
          }}
          onPageSizeChange={(pageSize) => {
            table.setPagination({ pageIndex: 0, pageSize });
          }}
          paging={paging}
        />
      ) : null}
    </div>
  );
}
