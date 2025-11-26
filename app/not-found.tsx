import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
      <h2 className="text-2xl font-bold text-gray-900">ページが見つかりません</h2>
      <p className="text-gray-600">お探しのページは存在しないか、移動した可能性があります。</p>
      <Link href="/">
        <Button>ホームに戻る</Button>
      </Link>
    </div>
  )
}
