import Explorer from "@/components/explorer";
export default function UniversePage({ params }: { params: { username: string } }) { return <Explorer username={params.username} />; }
