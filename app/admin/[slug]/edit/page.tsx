import AdminPanel from "../../AdminPanel"

type AdminGameEditPageProps = {
  params: Promise<{
    slug: string
  }>
}

export default async function AdminGameEditPage({ params }: AdminGameEditPageProps) {
  const { slug } = await params
  return <AdminPanel initialEditor={{ type: "game", slug }} />
}
