import React from "react";

export default function DataTable({ columns = [], data = [], className = "" }) {
  return (
    <div className={`bg-white rounded-2xl shadow-card border border-neutral-200 overflow-hidden ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 border-b border-neutral-200">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="p-4 text-left font-semibold text-neutral-700 whitespace-nowrap text-sm"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-neutral-200">
            {data.length === 0 && (
              <tr>
                <td
                  colSpan={columns.length}
                  className="p-8 text-center text-neutral-500"
                >
                  <div className="flex flex-col items-center justify-center">
                    <svg className="w-12 h-12 text-neutral-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-neutral-500">لا توجد بيانات للعرض</p>
                  </div>
                </td>
              </tr>
            )}

            {data.map((row, i) => (
              <tr
                key={i}
                className="transition-all duration-200 hover:bg-neutral-50/50"
              >
                {columns.map((col) => (
                  <td key={col.key} className="p-4 whitespace-nowrap text-neutral-700">
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}