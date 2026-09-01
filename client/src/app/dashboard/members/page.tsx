import { apiFetch } from "@/lib/api";

export default async function MemberPage(){
    const data = await apiFetch('/api/companies/members')

    return <>
    <div>Company members are:</div>
    <ul>
    {(data.members?.map((member:any) =>  (
     <li key={member._id}>
        <p>{member.userId.email}</p>
       </li>

    )
    ))}
    </ul>
    </>
}
