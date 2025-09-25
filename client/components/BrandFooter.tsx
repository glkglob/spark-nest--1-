import { Github, Twitter } from "lucide-react";

export default function BrandFooter() {
  return (
    <footer className="border-t bg-background">
      <div className="container py-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} Construction Success. All rights reserved.</p>
        <div className="flex items-center gap-3 text-muted-foreground">
          <a href="#" aria-label="GitHub" className="inline-flex h-9 w-9 items-center justify-center rounded-full border hover:text-foreground">
            <Github className="h-4 w-4" />
          </a>
          <a href="#" aria-label="Twitter" className="inline-flex h-9 w-9 items-center justify-center rounded-full border hover:text-foreground">
            <Twitter className="h-4 w-4" />
          </a>
        </div>
      </div>
    </footer>
  );
}
