import Link from "next/link";
import { LayoutDashboard, Github, Twitter, Linkedin } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-slate-50 dark:bg-slate-900/50 py-12 md:py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          <div className="col-span-2 lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
                <LayoutDashboard className="h-5 w-5" />
              </div>
              <span className="text-xl tracking-tight"><span className="font-bold">Flow</span> <span className="text-sm font-medium ml-1">By Quotearn</span></span>
            </Link>
            <p className="max-w-xs text-muted-foreground text-sm">
              The world&apos;s most popular project management tool. Empowering teams to work more collaboratively and get more done.
            </p>
            <div className="flex gap-4 mt-6">
              <Link href="#" className="text-muted-foreground hover:text-blue-600 transition-colors">
                 <Github className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-blue-400 transition-colors">
                 <Twitter className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-blue-700 transition-colors">
                 <Linkedin className="h-5 w-5" />
              </Link>
            </div>
          </div>
          
          {[
            {
              title: "Product",
              links: ["Features", "Pricing", "Integrations", "Security"]
            },
            {
              title: "Resources",
              links: ["Documentation", "Blog", "Community", "Guides"]
            },
            {
              title: "Company",
              links: ["About", "Jobs", "Legal", "Contact"]
            }
          ].map((column, index) => (
            <div key={index}>
              <h3 className="font-semibold mb-4">{column.title}</h3>
              <ul className="space-y-2">
                {column.links.map((link) => (
                  <li key={link}>
                    <Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        <div className="mt-12 pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <p>© 2024 Flow By Quotearn. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="#" className="hover:text-primary transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-primary transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
