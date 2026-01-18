// app/page.tsx
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
      <div className="text-center space-y-4">
        <h1 className="font-manrope text-3xl font-semibold">
          Rent Your Stuff Easily
        </h1>
        <p className="font-manrope text-gray-700 dark:text-gray-300">
          Find trusted rentals in your city
        </p>
        <Button>Click me</Button>
      </div>
    </div>
  );
}