import AdminPanel from "../../../AdminPanel"

type AdminHostingEditPageProps = {
  params: Promise<{
    slug: string
  }>
}

export default async function AdminHostingEditPage({ params }: AdminHostingEditPageProps) {
  const { slug } = await params
  return <AdminPanel initialEditor={{ type: "service", slug }} />
}
