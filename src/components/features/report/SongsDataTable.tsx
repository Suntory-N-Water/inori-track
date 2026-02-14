'use client';

import {
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
} from '@tanstack/react-table';
import * as React from 'react';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { SongInfo } from '@/types';

import { columns } from './columns';

type Props = {
  data: SongInfo[];
};

export function SongsDataTable({ data }: Props) {
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );

  const table = useReactTable({
    data,
    columns,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      columnFilters,
    },
  });

  return (
    <div className='w-full'>
      <div className='flex items-center py-4'>
        <Input
          placeholder='夢のつぼみ...'
          value={(table.getColumn('name')?.getFilterValue() as string) ?? ''}
          onChange={(event) =>
            table.getColumn('name')?.setFilterValue(event.target.value)
          }
          className='max-w-sm'
        />
      </div>
      <div className='overflow-x-auto rounded-md border'>
        <Table className='min-w-[1000px]'>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className='sticky top-0 z-20'>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={
                      // 見出しセルが透けないよう bg-white などで固定
                      header.column.id === 'name'
                        ? 'sticky left-0 z-20 bg-white'
                        : ''
                    }
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => {
                // count が 0 以上の場合は背景色を青くする
                const rowClasses =
                  row.original.count > 0
                    ? 'bg-blue20 hover:bg-blue30'
                    : 'bg-white hover:bg-slate-50';

                return (
                  <TableRow key={row.id} className={rowClasses}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className={
                          cell.column.id === 'name'
                            ? 'sticky left-0 z-10 w-[140px] min-w-[140px] text-baseblack bg-inherit '
                            : ''
                        }
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className='h-24 text-center'
                >
                  No results. - お探しの曲が見つかりませんでした🤔
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
