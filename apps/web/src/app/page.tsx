"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Button } from "../components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Heading, Text } from "../components/ui/Typography";

export default function Home() {
  const [theme, setTheme] = useState<"light" | "dark" | "system">("system");

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    if (theme !== "system") {
      root.classList.add(theme);
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === "system" ? "dark" : prev === "dark" ? "light" : "system");
  };

  return (
    <div className="w-full flex flex-col items-center pt-0 pb-12 relative overflow-hidden transition-colors duration-300">
      
      {/* Theme Toggle Button (Floating) using new Glass variant */}
      <Button 
        variant="glass"
        onClick={toggleTheme}
        className="absolute top-6 right-6 z-50 shadow-sm"
      >
        Theme: {theme.charAt(0).toUpperCase() + theme.slice(1)}
      </Button>

      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-accent opacity-20 blur-[100px] pointer-events-none transition-all duration-500" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-accent opacity-10 blur-[120px] pointer-events-none transition-all duration-500" />

      {/* Main Grid Constraint (Aligned with Navbar) */}
      <main className="w-full max-w-7xl mx-auto px-6 md:px-8 grid grid-cols-1 md:grid-cols-2 gap-8 z-10">
        
        {/* Left Column: Typography & CTAs */}
        <div className="flex flex-col justify-center gap-8 p-4">
          <div className="flex flex-col gap-2">
            <Heading level={1} glitch className="transition-colors">
              Rent Anything.
              <br />
              Anywhere.
            </Heading>
            <Text variant="lead" className="max-w-md mt-4 transition-colors">
              The premier peer-to-peer rental marketplace for students. Cameras, tools, and tech — all in your neighborhood.
            </Text>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-center">
            {/* Primary Action: Hyper-Liquid Sheen */}
            <Button variant="liquid" size="liquid">
              Explore Listings
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </Button>
            
            {/* Secondary Action: Frosted Cyber-Glass */}
            <Button variant="glass" size="lg">
              List an Item
            </Button>
            
            {/* Tertiary Action: Tactile Glitch */}
            <Button variant="glitch" className="ml-2">
              Learn More
            </Button>
          </div>
        </div>

        {/* Right Column: Chrome Card Showcase */}
        <div className="flex items-center justify-center relative p-4">
          <Card className="w-full max-w-md transition-all duration-300">
            {/* Custom image area outside of standard padding */}
            <div className="p-6 pb-0">
              <div className="w-full h-48 bg-foreground/5 rounded-2xl flex items-center justify-center overflow-hidden relative transition-colors">
                <span className="font-display text-2xl opacity-50">Image Placeholder</span>
              </div>
            </div>
            
            <CardHeader className="gap-2">
              <div className="flex justify-between items-start">
                <CardTitle className="glitch-text cursor-pointer">Sony A7IV Mirrorless</CardTitle>
                <Badge variant="default" className="text-sm px-3 py-1 transition-colors">$45/day</Badge>
              </div>
              <Text variant="muted" className="text-sm transition-colors">
                Professional full-frame camera perfect for student film projects. Includes 24-70mm lens.
              </Text>
            </CardHeader>
            
            <CardContent>
              <div className="flex gap-3 items-center mb-6">
                <div className="w-10 h-10 rounded-full bg-foreground/10 transition-colors" />
                <div className="flex flex-col justify-center">
                  <span className="text-sm font-bold transition-colors">Alex P.</span>
                  <span className="text-xs text-foreground/50 transition-colors">★ 4.9 (12 reviews)</span>
                </div>
              </div>
              
              {/* Secondary liquid CTA on cards */}
              <Button variant="liquid" className="w-full">
                Request Booking
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
