interface TitleActionsProps {
  title: string;
}

export function TitleActions({ title }: TitleActionsProps) {
  return (
    <div className="hidden md:flex flex-col md:flex-row md:items-start justify-between gap-2 mb-8">
      <div className="flex-1 min-w-0">
        <h1 className="text-2xl md:text-4xl font-bold font-syne leading-tight text-foreground">
          {title}
        </h1>
      </div>
    </div>
  );
}
