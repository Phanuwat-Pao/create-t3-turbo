import { Skeleton } from "@acme/ui/skeleton";

export default function Loading() {
  return (
    <div
      className="flex min-h-[calc(100vh-10rem)] flex-col items-center justify-center"
      aria-busy="true"
      aria-label="Loading reset password form"
    >
      <Skeleton className="h-50 w-87.5" />
    </div>
  );
}
