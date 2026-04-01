"use client";

import * as React from "react";
import {
  X,
  ChevronRight,
  ChevronLeft,
  LayoutDashboard,
  AlignLeft,
  Palette,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createBoard } from "@/actions/boards";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

// Themes mapping to background_color in schema

const themes = [
  { name: "Blue", class: "bg-blue-600" },
  { name: "Purple", class: "bg-purple-600" },
  { name: "Emerald", class: "bg-emerald-600" },
  { name: "Orange", class: "bg-orange-600" },
  { name: "Rose", class: "bg-rose-600" },
  { name: "Slate", class: "bg-slate-700" },
];

interface BoardOnboardingProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BoardOnboarding({ isOpen, onClose }: BoardOnboardingProps) {
  const [step, setStep] = React.useState(1);
  const [isLoading, setIsLoading] = React.useState(false);
  const [formData, setFormData] = React.useState({
    title: "",
    description: "",
    theme: themes[0].name,
  });

  const totalSteps = 3;

  const nextStep = () => setStep((s) => Math.min(s + 1, totalSteps));
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));
  
  const handleCreateBoard = async () => {
    setIsLoading(true);
    const result = await createBoard(formData);
    
    if (result.error) {
      toast.error(result.error);
      setIsLoading(false);
      return;
    }
    
    toast.success("Board created successfully!");
    setIsLoading(false);
    onClose();
    setStep(1);
    setFormData({
      title: "",
      description: "",
      theme: themes[0].name,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-background/80 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border bg-background shadow-2xl transition-all animate-in fade-in zoom-in duration-300">
        <div className="flex h-1.5 w-full bg-muted">
          <div 
            className="h-full bg-blue-600 transition-all duration-500 ease-in-out" 
            style={{ width: `${(step / totalSteps) * 100}%` }}
          />
        </div>

        <div className="p-8">
          <button 
            onClick={onClose}
            className="absolute right-4 top-4 rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="mb-8 flex flex-col items-center text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600/10 text-blue-600">
              {step === 1 && <LayoutDashboard className="h-6 w-6" />}
              {step === 2 && <AlignLeft className="h-6 w-6" />}
              {step === 3 && <Palette className="h-6 w-6" />}
            </div>
            <h2 className="text-2xl font-bold tracking-tight">
              {step === 1 && "Name your board"}
              {step === 2 && "Add a description"}
              {step === 3 && "Choose a theme"}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {step === 1 && "Pick a title that represents your project"}
              {step === 2 && "Help your team understand the goal (Optional)"}
              {step === 3 && "Pick a background color for your board"}
            </p>
          </div>

          <div className="min-h-[200px]">
            {step === 1 && (
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Board Title</Label>
                  <Input
                    id="title"
                    placeholder="e.g. Website Redesign"
                    value={formData.title}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, title: e.target.value })}
                    className="h-12 text-lg"
                    autoFocus
                  />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <textarea
                    id="description"
                    rows={4}
                    placeholder="What is this board about?"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="grid grid-cols-3 gap-3 py-4">
                {themes.map((theme) => (
                  <button
                    key={theme.name}
                    onClick={() => setFormData({ ...formData, theme: theme.name })}
                    className={cn(
                      "group relative flex h-20 items-center justify-center rounded-xl transition-all hover:scale-105",
                      theme.class,
                      formData.theme === theme.name && "ring-2 ring-blue-600 ring-offset-2 ring-offset-background"
                    )}
                  >
                    {formData.theme === theme.name && (
                      <div className="rounded-full bg-white p-1 text-black shadow-lg">
                        <Check className="h-4 w-4" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="mt-8 flex items-center justify-between pt-4 border-t">
            {step > 1 ? (
              <Button variant="ghost" onClick={prevStep}>
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            ) : (
              <div />
            )}
            
            <Button 
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20"
              disabled={(step === 1 && !formData.title) || isLoading}
              onClick={step === totalSteps ? handleCreateBoard : nextStep}
            >
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {step === totalSteps ? (isLoading ? "Creating..." : "Create Board") : "Continue"}
              {step !== totalSteps && !isLoading && <ChevronRight className="ml-2 h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
