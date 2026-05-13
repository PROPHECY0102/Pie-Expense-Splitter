import type { Snapshot } from '@/store'

export function downloadSnapshot(snapshot: Snapshot, filename = 'pie-data.json') {
  const blob = new Blob([JSON.stringify(snapshot, null, 2)], {
    type: 'application/json',
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export async function readSnapshotFromFile(file: File): Promise<Snapshot> {
  const text = await file.text()
  const data = JSON.parse(text)
  if (typeof data !== 'object' || data === null) {
    throw new Error('Invalid file: not a JSON object.')
  }
  if (
    !Array.isArray((data as Snapshot).users) ||
    !Array.isArray((data as Snapshot).groups) ||
    !Array.isArray((data as Snapshot).expenses)
  ) {
    throw new Error('Invalid Pie snapshot: missing required fields.')
  }
  return data as Snapshot
}
