import { MessageSquare } from "lucide-react";
import { startConversation } from "@/app/(app)/messages/actions";
import { Button } from "@/components/ui/Button";

// Posts to the startConversation server action, which opens (or creates) the
// thread with `otherId` and redirects to the chat.
export function MessageButton({
  otherId,
  label = "Message",
  variant = "outline",
}: {
  otherId: string;
  label?: string;
  variant?: "primary" | "brand" | "secondary" | "outline" | "ghost";
}) {
  return (
    <form action={startConversation}>
      <input type="hidden" name="otherId" value={otherId} />
      <Button type="submit" variant={variant}>
        <MessageSquare className="h-4 w-4" />
        {label}
      </Button>
    </form>
  );
}
