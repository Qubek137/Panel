let pendingCommand: string | null = null

export async function POST(req: Request) {
  const body = await req.json()
  pendingCommand = body.action
  return Response.json({ ok: true })
}

export async function GET() {
  const cmd = pendingCommand
  pendingCommand = null
  return Response.json({ action: cmd })
}
