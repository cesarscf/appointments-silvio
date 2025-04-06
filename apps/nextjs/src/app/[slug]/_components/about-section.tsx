export function AboutSection({ about }: { about: string | null }) {
  return (
    <div id="sobre" className="rounded-lg border p-6 shadow">
      <h3 className="mb-4 text-xl font-bold">SOBRE NÓS</h3>
      <div className="h-full space-y-4">
        <p>{about}</p>
      </div>
    </div>
  );
}
