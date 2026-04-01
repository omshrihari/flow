import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getInviteByToken, acceptInvite } from '@/actions/invites';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export default async function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  // Redirect to login if not authenticated
  if (!user) {
    const searchParams = new URLSearchParams();
    searchParams.set('next', `/invite/${token}`);
    redirect(`/login?${searchParams.toString()}`);
  }

  // Fetch invite details
  const { data: invite, error } = await getInviteByToken(token);

  if (error || !invite) {
    return (
      <div className="flex h-screen items-center justify-center bg-muted/40 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-500">Invalid Invitation</CardTitle>
            <CardDescription>{error || 'This invitation link is invalid or has expired.'}</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button asChild className="w-full">
              <a href="/dashboard">Return to Dashboard</a>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Determine role string formatting
  const roleDisplay = invite.role === 'editor' ? 'an Editor' : 'a Viewer';

  return (
    <div className="flex h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md shadow-lg border-primary/20">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/40">
            <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {invite.boards.title.substring(0, 1).toUpperCase()}
            </span>
          </div>
          <div>
            <CardTitle className="text-2xl font-bold tracking-tight">You've been invited!</CardTitle>
            <CardDescription className="text-base mt-2">
              You have been invited to join the board <strong className="text-foreground">{invite.boards.title}</strong> as {roleDisplay}.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl bg-muted p-4 text-center">
            <p className="text-sm text-muted-foreground mb-1">Invited by</p>
            {/* Supabase doesn't easily return joined User fields without explicit schemas, so we fallback gracefully */}
            <p className="font-medium text-foreground">A Board Member</p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-3">
          <form action={async () => {
            'use server';
            const result = await acceptInvite(token);
            if (result.data) {
              redirect(`/board/${result.data.slug}`);
            }
          }} className="w-full">
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium h-11">
              Accept Invitation
            </Button>
          </form>
          <Button asChild variant="ghost" className="w-full">
            <a href="/dashboard">Decline & Return Home</a>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
