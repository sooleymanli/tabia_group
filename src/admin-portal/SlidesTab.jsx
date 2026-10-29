import { useState } from 'react'
import { ArrowDown, ArrowUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  deckTitle,
  formatDuration,
  slideOrder,
  slideTitle,
} from './adminFormat'

const COLUMNS = [
  { id: 'order', label: 'Slayd', numeric: false },
  { id: 'views', label: 'Baxış', numeric: true },
  { id: 'viewing_sessions', label: 'Sessiya', numeric: true },
  { id: 'avgActive', label: 'Orta aktiv vaxt', numeric: true },
  { id: 'likes', label: 'Bəyəndim', numeric: true },
  { id: 'dislikes', label: 'Bəyənmədim', numeric: true },
  { id: 'comments', label: 'Rəy', numeric: true },
]

export function SlidesTab({ slides }) {
  const [sort, setSort] = useState({ by: 'order', desc: false })

  const rows = slides
    .map((row) => ({
      ...row,
      order: slideOrder(row.deck_id, row.slide_id),
      avgActive: row.viewing_sessions
        ? Number(row.active_ms) / Number(row.viewing_sessions)
        : 0,
    }))
    .sort((a, b) => {
      const diff = Number(a[sort.by]) - Number(b[sort.by])
      return sort.desc ? -diff : diff
    })

  if (rows.length === 0) {
    return (
      <p className="text-muted-foreground">
        Hələ baxış yoxdur. Müştəri PIN ilə daxil olub slaydlara baxdıqca
        statistika burada yaranacaq.
      </p>
    )
  }

  return (
    <div>
      <p className="max-w-[70ch] text-sm text-muted-foreground">
        Orta aktiv vaxt bir sessiyanın slaydda keçirdiyi görünən və aktiv
        vaxtdır. Admin önizləməsi daxil deyil.
      </p>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="border-b text-xs text-muted-foreground">
            <tr>
              {COLUMNS.map((column) => {
                const active = sort.by === column.id
                const Arrow = sort.desc ? ArrowDown : ArrowUp
                return (
                  <th
                    key={column.id}
                    aria-sort={
                      active ? (sort.desc ? 'descending' : 'ascending') : 'none'
                    }
                    className={cn(
                      'py-2 pr-4 font-medium',
                      column.numeric && 'text-right',
                    )}
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setSort({
                          by: column.id,
                          desc: active ? !sort.desc : column.numeric,
                        })
                      }
                      className={cn(
                        'inline-flex items-center gap-1 rounded-sm outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50',
                        active && 'text-foreground',
                      )}
                    >
                      {column.label}
                      {active && (
                        <Arrow className="size-3" aria-hidden="true" />
                      )}
                    </button>
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody className="divide-y">
            {rows.map((row) => (
              <tr key={`${row.deck_id}/${row.slide_id}`}>
                <td className="py-3 pr-4">
                  <span className="font-medium text-ink">
                    {slideTitle(row.deck_id, row.slide_id)}
                  </span>
                  <span className="block text-xs text-muted-foreground">
                    {deckTitle(row.deck_id)}
                  </span>
                </td>
                <td className="py-3 pr-4 text-right tabular-nums">
                  {row.views}
                </td>
                <td className="py-3 pr-4 text-right tabular-nums">
                  {row.viewing_sessions}
                </td>
                <td className="py-3 pr-4 text-right tabular-nums">
                  {formatDuration(row.avgActive)}
                </td>
                <td className="py-3 pr-4 text-right tabular-nums">
                  {row.likes}
                </td>
                <td className="py-3 pr-4 text-right tabular-nums">
                  {row.dislikes}
                </td>
                <td className="py-3 pr-4 text-right tabular-nums">
                  {row.comments}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
