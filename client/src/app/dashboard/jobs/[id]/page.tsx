import { apiFetch } from "@/lib/api"
import PublishCloseButtons from "./publish-close-buttons"

type Props = {
    params: Promise<{id:string}>
}

async function JobsPage({params}: Props) {
    const {id} = await params

    const data = await apiFetch(`/api/jobs/${id}`)
  return (
    <>
        <div>Job detail page</div>
        <h1>Job Title: {data.title}</h1>
        <h1>Job Description: {data.description}</h1>
        <h1>Job Status: {data.status}</h1>
        <PublishCloseButtons jobId={id} status={data.status} />
    </>
  )
}

export default JobsPage
