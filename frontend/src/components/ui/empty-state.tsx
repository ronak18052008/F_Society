export function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="border border-dashed border-line px-6 py-16 text-center">
      <h2 className="font-serif text-3xl">{title}</h2>
      <p className="mx-auto mt-3 max-w-md text-sm text-ink-soft">{body}</p>
      {action ? <div className="mt-6 flex justify-center">{action}</div> : null}
    </div>
  );
}
