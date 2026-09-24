"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

type Props = {
  action: (formData: FormData) => void | Promise<void>;
  id: string;
  label: string;
  disabled?: boolean;
  confirmation?: {
    title: string;
    description: string;
  };
};

export function AdminActionButton({ action, id, label, disabled, confirmation }: Props) {
  if (!confirmation) {
    return (
      <form action={action}>
        <input type="hidden" name="id" value={id} />
        <Button type="submit" size="sm" variant="outline" disabled={disabled}>
          {label}
        </Button>
      </form>
    );
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger
        render={<Button type="button" size="sm" variant="destructive" disabled={disabled} />}
      >
        {label}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{confirmation.title}</AlertDialogTitle>
          <AlertDialogDescription>{confirmation.description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <form action={action}>
            <input type="hidden" name="id" value={id} />
            <AlertDialogAction type="submit" variant="destructive">
              {label}
            </AlertDialogAction>
          </form>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
