"use client";

import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { 
  BarChart3, 
  Layers, 
  Users, 
  Zap, 
  Shield, 
  Globe 
} from "lucide-react";

const features = [
  {
    title: "Project Management",
    description: "Keep your team's projects and tasks organized in boards, lists, and cards.",
    icon: Layers,
    color: "text-blue-600",
    bg: "bg-blue-600/10",
  },
  {
    title: "Collaboration",
    description: "Invite your teammates to collaborate, assign tasks, and track progress together.",
    icon: Users,
    color: "text-green-600",
    bg: "bg-green-600/10",
  },
  {
    title: "Automation",
    description: "Automate repetitive tasks and workflows with Butler, so you can focus on work that matters.",
    icon: Zap,
    color: "text-yellow-600",
    bg: "bg-yellow-600/10",
  },
  {
    title: "Power-Ups",
    description: "Integrate your favorite tools like Slack, Google Drive, and Jira directly into Flow.",
    icon: Globe,
    color: "text-purple-600",
    bg: "bg-purple-600/10",
  },
  {
    title: "Analytics",
    description: "Get insights into your team's productivity and performance with built-in reporting.",
    icon: BarChart3,
    color: "text-red-600",
    bg: "bg-red-600/10",
  },
  {
    title: "Enterprise Security",
    description: "Keep your data safe with enterprise-grade security and administrative controls.",
    icon: Shield,
    color: "text-cyan-600",
    bg: "bg-cyan-600/10",
  },
];

export function Features() {
  return (
    <section id="features" className="py-24 bg-slate-50 dark:bg-slate-900/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            A productivity powerhouse
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Simple, flexible, and powerful. All the features you need to manage any project with ease.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="group border-none shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white dark:bg-slate-800">
              <CardHeader>
                <div className={`w-12 h-12 rounded-lg ${feature.bg} flex items-center justify-center mb-4 transition-transform group-hover:scale-110`}>
                  <feature.icon className={`h-6 w-6 ${feature.color}`} />
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
