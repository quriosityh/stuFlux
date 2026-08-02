import { Button } from "@/components/ui/Button";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select"
export const Header = () => {
  return (
    <header className="border-b">
        
      <div className="container flex h-16 items-center justify-between">
        <div className="font-manrope text-xl font-bold">Rent Your Stuff</div>
        <nav className="flex items-center space-x-4">
          <Button variant="ghost">Home</Button>
          <Button variant="ghost">About</Button>
          <Button variant="ghost">Contact</Button>
          {/* <Select>
  <SelectTrigger className="w-[180px] focus:ring-0 border-0 bg-transparent">
    <SelectValue placeholder="Theme" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="light">Light</SelectItem>
    <SelectItem value="dark">Dark</SelectItem>
    <SelectItem value="system">System</SelectItem>
  </SelectContent>
</Select> */}

        </nav>
      </div>
    </header>
  );
}