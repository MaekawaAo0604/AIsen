import { BoardPageClient } from './BoardPageClient'

export default async function BoardPage({ params }: { params: Promise<{ boardId: string }> }) {
  const { boardId } = await params
  return <BoardPageClient boardId={boardId} />
}
