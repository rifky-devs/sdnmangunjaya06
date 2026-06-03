import React from 'react';
import LoadingSkeleton from './LoadingSkeleton.jsx';
import EmptyState from './EmptyState.jsx';

export default function DataTable({
  columns = [],
  data = [],
  loading = false,
  emptyTitle = 'Data Tidak Ditemukan',
  emptyDescription = 'Tidak ada data yang sesuai dengan filter atau kata kunci.',
  emptyIcon,
  stickyHeader = true,
  className = ''
}) {
  if (loading) {
    return <LoadingSkeleton type="table" rows={6} className="p-6" />;
  }

  if (!data || data.length === 0) {
    return (
      <div className="py-12 border-t border-slate-100 bg-white rounded-b-3xl">
        <EmptyState 
          title={emptyTitle} 
          description={emptyDescription} 
          icon={emptyIcon} 
        />
      </div>
    );
  }

  return (
    <div className={`w-full overflow-x-auto border-t border-slate-100 bg-white rounded-b-[2rem] ${className}`}>
      <table className="w-full min-w-[800px] border-collapse text-left">
        <thead className={`bg-slate-50/70 backdrop-blur-sm ${stickyHeader ? 'sticky top-0 z-10 border-b border-slate-100' : ''}`}>
          <tr>
            {columns.map((col, idx) => (
              <th
                key={col.key || idx}
                className={`px-6 py-4 text-xs font-black uppercase tracking-wider text-slate-400 select-none ${col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : ''} ${col.width ? col.width : ''}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 font-plus-jakarta">
          {data.map((row, rowIdx) => (
            <tr 
              key={row.id || rowIdx} 
              className="group hover:bg-slate-50/50 transition-colors duration-200"
            >
              {columns.map((col, colIdx) => {
                const val = col.accessor ? row[col.accessor] : null;
                const cellAlign = col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : '';
                return (
                  <td
                    key={col.key || colIdx}
                    className={`px-6 py-3.5 text-xs font-semibold text-slate-700 leading-normal ${cellAlign}`}
                  >
                    {col.render ? col.render(row, rowIdx) : (val !== null && val !== undefined ? String(val) : '-')}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
