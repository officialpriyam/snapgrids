import AdminPanel, { type InitialEditor } from "../../../AdminPanel"

type AdminLegalEditPageProps = {
  params: Promise<{
    kind: string
  }>
}

export default async function AdminLegalEditPage({ params }: AdminLegalEditPageProps) {
  const { kind } = await params
  const legalKind: InitialEditor =
    kind === "privacy-policy"
      ? { type: "legal", kind: "privacyPolicy" }
      : { type: "legal", kind: "termsOfService" }

  return <AdminPanel initialEditor={legalKind} />
}
