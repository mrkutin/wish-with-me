export async function GET(
  req: Request,
  { params }: { params: { token: string } }
) {
  const res = await fetch(`${process.env.API_URL}/wishlists/share/${params.token}`)
  return new Response(JSON.stringify(await res.json()), {
    status: res.status,
    headers: { 'Content-Type': 'application/json' }
  })
} 