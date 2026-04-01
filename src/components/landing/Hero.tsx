"use client";

import { Button } from "../ui/button";
import { MoveRight, Star } from "lucide-react";
import Image from "next/image";

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-32 pb-20 lg:pt-48 lg:pb-32">
      {/* Background decoration */}
      <div className="absolute top-0 left-1/2 -z-10 h-[1000px] w-[1000px] -translate-x-1/2 rounded-full bg-gradient-to-b from-blue-500/20 to-transparent blur-3xl opacity-50" />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-1.5 text-sm font-medium text-blue-600">
            <Star className="h-4 w-4 fill-current" />
            <span>The #1 task management platform</span>
          </div>
          
          <h1 className="mt-8 max-w-4xl text-5xl font-extrabold tracking-tight sm:text-7xl">
            Flow brings all your <span className="text-blue-600">tasks, teammates,</span> and tools together
          </h1>
          
          <p className="mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl">
            Keep everything in the same place—even if your team isn’t. From high-level strategy to the smallest details, Flow powers your productivity.
          </p>
          
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
            <Button size="lg" className="h-12 px-8 text-base bg-blue-600 hover:bg-blue-700 text-white group">
              Get Started for Free
              <MoveRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button variant="outline" size="lg" className="h-12 px-8 text-base">
              Watch Demo
            </Button>
          </div>

          <div className="mt-16 w-full max-w-5xl rounded-2xl border border-white/10 bg-white/5 p-2 backdrop-blur-sm shadow-2xl">
              <div className="aspect-[16/9] overflow-hidden rounded-xl bg-slate-900 shadow-inner relative">
                {/* Mockup UI */}
                <div className="absolute inset-0 flex items-start p-4 gap-4 overflow-hidden">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="w-64 flex-shrink-0 flex flex-col gap-2">
                            <div className="flex items-center justify-between px-2">
                                <div className="h-4 w-24 rounded bg-white/10" />
                                <div className="h-4 w-4 rounded bg-white/10" />
                            </div>
                            {[1, 2, 3].map((j) => (
                                <div key={j} className="h-24 w-full rounded-lg bg-white/5 border border-white/10 p-3 flex flex-col gap-2">
                                     <div className="h-3 w-3/4 rounded bg-white/20" />
                                     <div className="h-2 w-1/2 rounded bg-white/10" />
                                     <div className="mt-auto flex gap-1">
                                        <div className="h-2 w-8 rounded-full bg-blue-500/50" />
                                        <div className="h-2 w-8 rounded-full bg-green-500/50" />
                                     </div>
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
                {/* Overlay gradient */}
                <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-slate-900 to-transparent pointer-events-none" />
              </div>
          </div>
        </div>
      </div>
    </section>
  );
}
